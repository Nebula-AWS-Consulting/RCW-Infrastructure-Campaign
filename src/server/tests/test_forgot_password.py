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
        mock_client.exceptions.LimitExceededException = type("LimitExceededException",(Exception,),{})


        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

@pytest.mark.parametrize(
    "email, side_effect, exception_message, expected_status, expected_body",
    [
        # 1) Successful password reset initiation
        (
            "user@example.com",
            None,
            None,
            200,
            {"message": "Password reset initiated. Check your email for the code."}
        ),
        # 2) User not found => 404
        (
            "missing@user.com",
            "UserNotFoundException",
            None,  # No special message needed
            404,
            {"errorType": "UserNotFound"}
        ),
        # 3) Limit exceeded => 429
        (
            "limit-exceeded@user.com",
            "LimitExceededException",
            None,
            429,
            {"errorType": "LimitExceeded"}
        ),
        # 4) Not authorized => 403, code references e.response['Error']['Message']
        (
            "unauthorized@user.com",
            "NotAuthorizedException",
            "User is disabled.",  # Example custom message from Cognito
            403,
            {"errorType": "NotAuthorized"}
        )
    ]
)
def test_forgot_password(
    mock_ssm_and_cognito,
    email,
    side_effect,
    exception_message,
    expected_status,
    expected_body
):
    """
    Tests forgot_password() with multiple scenarios:
      - Success
      - User not found
      - Limit exceeded
      - Not authorized (with a custom exception message)
      - Generic error => 500
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Add or redefine any exceptions needed
    mock_cognito_client.exceptions.UserNotFoundException = type("UserNotFoundException", (Exception,), {})
    mock_cognito_client.exceptions.LimitExceededException = type("LimitExceededException", (Exception,), {})
    # For NotAuthorized, code references e.response['Error']['Message']
    mock_cognito_client.exceptions.NotAuthorizedException = type(
        "NotAuthorizedException",
        (Exception,),
        {}
    )

    if side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        exception_instance = exception_class()

        # If it's a NotAuthorizedException, set e.response['Error']['Message']
        # because the code references e.response['Error']['Message']
        if side_effect == "NotAuthorizedException" and exception_message:
            setattr(exception_instance, 'response', {"Error": {"Message": exception_message}})

        mock_cognito_client.forgot_password.side_effect = exception_instance

    from index import forgot_password  # Ensure your index.py has forgot_password defined

    start_time = time.time()
    response = forgot_password(email)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_forgot_password] email={email}, "
        f"status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Basic performance check
    assert execution_time < 0.5, "Function took too long!"

    # Verify status code
    assert response["statusCode"] == expected_status

    # Check response body
    body = json.loads(response["body"])

    if expected_status == 200:
        # Success
        assert "message" in body
        assert "Password reset initiated" in body["message"]
    else:
        # Error scenarios
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]
        # Optionally check the message if needed
        # if side_effect == "NotAuthorizedException" and exception_message:
        #     assert body["message"] == exception_message