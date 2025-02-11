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
        mock_client.exceptions.CodeMismatchException = type("CodeMismatchException", (Exception,), {})
        mock_client.exceptions.ExpiredCodeException = type("ExpiredCodeException", (Exception,), {})
        mock_client.exceptions.InvalidPasswordException = type("InvalidPasswordException", (Exception,), {})
        mock_client.exceptions.NotAuthorizedException = type("NotAuthorizedException",(Exception,),{})
        mock_client.exceptions.UserNotFoundException = type("UserNotFoundException",(Exception,),{})


        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

@pytest.mark.parametrize(
    "email, confirmation_code, new_password, side_effect, exception_message, expected_status, expected_body",
    [
        # 1) Successful password reset
        (
            "user@example.com",
            "123456",
            "NewPassword123!",
            None,
            None,
            200,
            {"message": "Password reset successfully."}
        ),
        # 2) CodeMismatchException => 400
        (
            "user@example.com",
            "wrongcode",
            "NewPassword123!",
            "CodeMismatchException",
            None,
            400,
            {"message": "Password reset successfully."}
        ),
        # 3) ExpiredCodeException => 400
        (
            "user@example.com",
            "expired",
            "NewPassword123!",
            "ExpiredCodeException",
            None,
            400,
            {"message": "Password reset successfully."}
        ),
        # 4) InvalidPasswordException => 400 (pulls message from e.response['Error']['Message'])
        (
            "user@example.com",
            "123456",
            "bad",
            "InvalidPasswordException",
            "Password must have uppercase letters",  # for example
            400,
            {"message": "Password reset successfully."}
        ),
        # 5) UserNotFoundException => 404
        (
            "notfound@example.com",
            "123456",
            "NewPassword123!",
            "UserNotFoundException",
            None,
            404,
            {"message": "Password reset successfully."}
        ),
        # 6) LimitExceededException => 429
        (
            "limit@example.com",
            "123456",
            "NewPassword123!",
            "LimitExceededException",
            None,
            429,
            {"message": "Password reset successfully."}
        )
    ]
)
def test_confirm_forgot_password(
    mock_ssm_and_cognito,
    email,
    confirmation_code,
    new_password,
    side_effect,
    exception_message,
    expected_status,
    expected_body
):
    """
    Tests confirm_forgot_password with multiple scenarios:
      - Success
      - Code mismatch
      - Code expired
      - Invalid password
      - User not found
      - Limit exceeded
      - Generic error => 500
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Define or update Cognito exceptions used by confirm_forgot_password
    mock_cognito_client.exceptions.CodeMismatchException = type("CodeMismatchException", (Exception,), {})
    mock_cognito_client.exceptions.ExpiredCodeException = type("ExpiredCodeException", (Exception,), {})
    mock_cognito_client.exceptions.InvalidPasswordException = type("InvalidPasswordException", (Exception,), {})
    mock_cognito_client.exceptions.UserNotFoundException = type("UserNotFoundException", (Exception,), {})
    mock_cognito_client.exceptions.LimitExceededException = type("LimitExceededException", (Exception,), {})

    # Set up side effect if any
    if side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        exception_instance = exception_class()
        # If it's InvalidPasswordException, code references e.response['Error']['Message']
        if side_effect == "InvalidPasswordException" and exception_message:
            setattr(exception_instance, 'response', {"Error": {"Message": exception_message}})
        mock_cognito_client.confirm_forgot_password.side_effect = exception_instance

    from index import confirm_forgot_password  # Make sure your index.py has confirm_forgot_password defined

    start_time = time.time()
    response = confirm_forgot_password(email, confirmation_code, new_password)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_confirm_forgot_password] email={email}, code={confirmation_code}, "
        f"status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Basic performance check
    assert execution_time < 0.5, "Function took too long!"

    # Verify status code
    assert response["statusCode"] == expected_status

    # Check response body
    body = json.loads(response["body"])

    if expected_status == 200:
        assert body["message"] == "Password reset successfully."
    else:
        # Error scenarios
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]
        # Optionally, if you want to verify the exact message from InvalidPasswordException:
        # if side_effect == "InvalidPasswordException" and exception_message:
        #     # The code includes the original message in "Your new password is invalid: {message}. Please..."
        #     expected_msg_substring = f"Your new password is invalid: {exception_message}"
        #     assert expected_msg_substring in body["message"]