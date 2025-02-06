import os
import time
import json
import pytest
from unittest.mock import patch

@pytest.fixture
def mock_ssm_and_cognito():
    """
    A Pytest fixture that patches out SSM and Cognito for all tests.
    Sets up 'fake_user_pool_id' and the Cognito exception classes.
    """
    with patch('index.ssm') as mock_ssm, patch('index.client') as mock_client:
        # Mock SSM to return a fake user pool ID
        mock_ssm.get_parameter.return_value = {
            "Parameter": {"Value": "fake_user_pool_id"}
        }

        # Mock Cognito exception classes so we can raise them easily
        mock_client.exceptions.NotAuthorizedException = type(
            "NotAuthorizedException",
            (Exception,),
            {}
        )
        mock_client.exceptions.UserNotFoundException = type(
            "UserNotFoundException",
            (Exception,),
            {}
        )

        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

fake_jwt = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."  # header (base64)
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwidGVzdCI6InRva2VuIn0."  # payload (base64)
    "h0QQR0mhHDnFYnA54zKRlkp8qPgHNDaTaLz-MBslc5k"       # signature (base64)
)


@pytest.mark.parametrize(
    "env_value,username,password,init_auth_side_effect,init_auth_return,expected_status",
    [
        # 1) Successful login (correct credentials)
        (
            "dev",                  # ENVIRONMENT
            "test@example.com",     # username
            "testpassword",         # password
            None,                   # no side effect (no exception)
            {
                "AuthenticationResult": {
                    "IdToken": fake_jwt,
                    "AccessToken": "fake-access-token",
                    "RefreshToken": "fake-refresh-token"
                }
            },
            200
        ),
        # 2) Wrong password => Cognito NotAuthorizedException => expect 401
        (
            "dev",
            "test@example.com",
            "wrongpassword",
            "NotAuthorizedException",
            None,
            401
        ),
        # 3) Non-existent user => Cognito UserNotFoundException => expect 404
        (
            "dev",
            "nouser@example.com",
            "testpassword",
            "UserNotFoundException",
            None,
            404
        ),
        # 4) Missing credentials => expect 400
        (
            "dev",
            "",
            "",
            None,
            None,
            400
        ),
        # 5) Missing or invalid ENVIRONMENT => let's say you return 500
        (
            "",  # empty ENVIRONMENT
            "test@example.com",
            "testpassword",
            None,
            None,
            500
        ),
    ]
)
def test_log_in(
    mock_ssm_and_cognito,
    env_value,
    username,
    password,
    init_auth_side_effect,
    init_auth_return,
    expected_status
):
    """
    A single, parameterized test that covers:
    - Valid logins
    - Invalid passwords
    - Missing users
    - Missing credentials
    - Missing/invalid ENVIRONMENT
    - Performance checks
    - Correct output structure
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    #
    # 1) Decide how to mock Cognito based on the scenario
    #
    if init_auth_side_effect:
        # e.g. "NotAuthorizedException" => raise that exception
        side_effect_class = getattr(mock_cognito_client.exceptions, init_auth_side_effect, None)
        mock_cognito_client.initiate_auth.side_effect = side_effect_class()
    elif init_auth_return:
        # Return a successful AuthenticationResult
        mock_cognito_client.initiate_auth.return_value = init_auth_return

    #
    # 2) Patch the ENVIRONMENT variable
    #
    # If env_value is empty, we're simulating no or invalid ENV variable
    # (clear=True ensures no other environment vars like ENVIRONMENT remain)
    env_patch = {"ENVIRONMENT": env_value} if env_value else {}
    with patch.dict(os.environ, env_patch, clear=True):
        from index import log_in  # import after patching the environment

        #
        # 3) Timing: measure execution time for performance
        #
        start_time = time.time()
        response = log_in(username, password)
        end_time = time.time()

        execution_time = end_time - start_time
        print(
            f"[test_log_in] ENV={env_value}, user={username}, "
            f"status={response['statusCode']}, time={execution_time:.4f}s"
        )

        #
        # 4) Performance Check
        #
        # Suppose we want each scenario to run under 0.5s (arbitrary threshold)
        #
        assert execution_time < 0.5, "Function took too long!"

        #
        # 5) Verify HTTP Status
        #
        assert response["statusCode"] == expected_status

        #
        # 6) If success => check tokens
        #
        if expected_status == 200:
            body = json.loads(response["body"])
            # Ensure the response has the correct keys
            assert "id_token" in body, "Missing 'id_token' from successful response"
            assert body["id_token"] == fake_jwt

            # Optionally check other tokens
            assert "access_token" in body
            assert "refresh_token" in body
        else:
            # For error scenarios, you can assert the shape or content of the error
            # For example, if your function returns an error message in the body:
            # body = json.loads(response["body"])
            # assert "error" in body
            pass