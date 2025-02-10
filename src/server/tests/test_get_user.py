import os
import sys
import time
import json
import pytest
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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
        mock_client.exceptions.NotAuthorizedException = type("NotAuthorizedException",(Exception,),{})
        mock_client.exceptions.UserNotFoundException = type("UserNotFoundException",(Exception,),{})
        mock_client.exceptions.TooManyRequestsException = type("TooManyRequestsException",(Exception,),{})


        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

@pytest.mark.parametrize(
    "email, side_effect, mock_return, expected_status, expected_body",
    [
        # 1) Missing email => 400, no call to admin_get_user
        (
            "",  # empty email triggers early return
            None,
            None,
            400,
            {"message": "Missing required 'email' query parameter"}
        ),
        # 2) Successful retrieval => 200
        (
            "user@example.com",
            None,
            {
                "UserAttributes": [
                    {"Name": "email", "Value": "user@example.com"},
                    {"Name": "sub", "Value": "abc-123"},
                ]
            },
            200,
            {"message": "User data retrieved successfully"}
        ),
        # 3) User not found => 404
        (
            "notfound@example.com",
            "UserNotFoundException",
            None,
            404,
            {"errorType": "UserNotFound"}
        ),
        # 4) Invalid parameter => 400
        (
            "bad@param.com",
            "InvalidParameterException",
            None,
            400,
            {"errorType": "InvalidParameter"}
        ),
        # 5) Too many requests => 429
        (
            "rate@limit.com",
            "TooManyRequestsException",
            None,
            429,
            {"errorType": "TooManyRequests"}
        )
    ]
)
def test_get_user(
    mock_ssm_and_cognito,
    email,
    side_effect,
    mock_return,
    expected_status,
    expected_body
):
    """
    Test get_user function with various scenarios:
    1) Missing email => 400
    2) Success => 200 (checks user attributes)
    3) User not found => 404
    4) Invalid parameter => 400
    5) Too many requests => 429
    6) Generic internal server error => 500
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Define/extend exceptions needed
    mock_cognito_client.exceptions.UserNotFoundException = type("UserNotFoundException", (Exception,), {})
    mock_cognito_client.exceptions.InvalidParameterException = type("InvalidParameterException", (Exception,), {})
    mock_cognito_client.exceptions.TooManyRequestsException = type("TooManyRequestsException", (Exception,), {})

    # If there's a side effect, set it
    if side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        mock_cognito_client.admin_get_user.side_effect = exception_class()
    else:
        # Otherwise, return a successful user record if provided
        if mock_return is not None:
            mock_cognito_client.admin_get_user.return_value = mock_return

    from index import get_user  # Ensure index.py has get_user defined

    start_time = time.time()
    response = get_user(email)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_get_user] email={email}, status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Quick performance check
    assert execution_time < 0.5, "Function took too long!"

    # Check status code
    assert response["statusCode"] == expected_status

    # Parse body
    body = json.loads(response["body"])

    if expected_status == 400 and not email:
        # Missing email scenario
        assert "Missing required 'email' query parameter" in body["message"]
    elif expected_status == 200:
        # Check success message
        assert body["message"] == "User data retrieved successfully"
        # Confirm user_attributes are returned
        assert "user_attributes" in body
        # Optionally verify the mock_return was mapped correctly
        # e.g. "user@example.com" is the 'email' key
        user_attrs = body["user_attributes"]
        assert user_attrs.get("email") == "user@example.com"
    else:
        # Error scenarios
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]
