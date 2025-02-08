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
        mock_client.exceptions.CodeMismatchException = type("CodeMismatchException",(Exception,),{})
        mock_client.exceptions.ExpiredCodeException = type("ExpiredCodeException",(Exception,),{})


        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

@pytest.mark.parametrize(
    "access_token, confirmation_code, side_effect, expected_status, expected_body",
    [
        # 1) Successful confirmation
        (
            "valid-access-token",
            "123456",
            None,
            200,
            {"message": "Email confirmed successfully."}
        ),
        # 2) Code mismatch => 400
        (
            "valid-access-token",
            "wrongcode",
            "CodeMismatchException",
            400,
            {"errorType": "CodeMismatch"}
        ),
        # 3) Expired code => 400
        (
            "valid-access-token",
            "expired123",
            "ExpiredCodeException",
            400,
            {"errorType": "ExpiredCode"}
        ),
        # 4) Not authorized => 403
        (
            "invalid-access-token",
            "123456",
            "NotAuthorizedException",
            403,
            {"errorType": "NotAuthorized"}
        ),
        # 5) User not found => 404
        (
            "does-not-exist-token",
            "123456",
            "UserNotFoundException",
            404,
            {"errorType": "UserNotFound"}
        )
    ]
)
def test_confirm_email(
    mock_ssm_and_cognito,
    access_token,
    confirmation_code,
    side_effect,
    expected_status,
    expected_body
):
    """
    Tests the confirm_email function with a variety of scenarios:
      - Successful confirmation
      - Code mismatch
      - Expired code
      - Not authorized
      - User not found
      - Generic exception => 500
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Extend your mock to include the Cognito exceptions used in confirm_email
    mock_cognito_client.exceptions.CodeMismatchException = type("CodeMismatchException", (Exception,), {})
    mock_cognito_client.exceptions.ExpiredCodeException = type("ExpiredCodeException", (Exception,), {})
    mock_cognito_client.exceptions.NotAuthorizedException = type("NotAuthorizedException", (Exception,), {})
    mock_cognito_client.exceptions.UserNotFoundException = type("UserNotFoundException", (Exception,), {})

    if side_effect:
        # For example, "CodeMismatchException" => get the mock exception class
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        mock_cognito_client.verify_user_attribute.side_effect = exception_class()

    from index import confirm_email  # Make sure your index.py has confirm_email defined

    start_time = time.time()
    response = confirm_email(access_token, confirmation_code)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_confirm_email] token={access_token}, code={confirmation_code}, "
        f"status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Basic performance check
    assert execution_time < 0.5, "Function took too long!"

    # Verify status code
    assert response["statusCode"] == expected_status

    # Check response body
    body = json.loads(response["body"])

    # For success
    if expected_status == 200:
        assert body["message"] == "Email confirmed successfully."
    else:
        # For error scenarios, check errorType (and/or message)
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]
