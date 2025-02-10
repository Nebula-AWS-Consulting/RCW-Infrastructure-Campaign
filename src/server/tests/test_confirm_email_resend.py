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
    "access_token, side_effect, expected_status, expected_body",
    [
        # 1) Successful resend
        (
            "valid-access-token",
            None,
            200,
            {"message": "Verification code sent successfully."}
        ),
        # 2) LimitExceeded => 429
        (
            "limit-exceeded-token",
            "LimitExceededException",
            429,
            {"errorType": "LimitExceeded"}
        ),
        # 3) NotAuthorized => 403
        (
            "no-authorization-token",
            "NotAuthorizedException",
            403,
            {"errorType": "NotAuthorized"}
        ),
        # 4) UserNotFound => 404
        (
            "notfound-token",
            "UserNotFoundException",
            404,
            {"errorType": "UserNotFound"}
        )
    ]
)
def test_confirm_email_resend(
    mock_ssm_and_cognito,
    access_token,
    side_effect,
    expected_status,
    expected_body
):
    """
    Tests confirm_email_resend with various scenarios:
      - Successful resend
      - Limit exceeded
      - Not authorized
      - User not found
      - Generic internal error
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Add any missing exceptions used by confirm_email_resend
    mock_cognito_client.exceptions.LimitExceededException = type("LimitExceededException", (Exception,), {})
    mock_cognito_client.exceptions.NotAuthorizedException = type("NotAuthorizedException", (Exception,), {})
    mock_cognito_client.exceptions.UserNotFoundException = type("UserNotFoundException", (Exception,), {})

    # If there's a side effect, raise that exception in get_user_attribute_verification_code
    if side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        mock_cognito_client.get_user_attribute_verification_code.side_effect = exception_class()

    from index import confirm_email_resend  # Ensure your index.py has confirm_email_resend defined

    start_time = time.time()
    response = confirm_email_resend(access_token)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_confirm_email_resend] token={access_token}, "
        f"status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Basic performance check
    assert execution_time < 0.5, "Function took too long!"

    # Verify status code
    assert response["statusCode"] == expected_status

    # Check response body
    body = json.loads(response["body"])

    if expected_status == 200:
        assert body["message"] == "Verification code sent successfully."
    else:
        # For error scenarios, verify errorType
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]
