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


        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

@pytest.mark.parametrize(
    "email, side_effect, expected_status, expected_body",
    [
        # 1) Successful confirmation
        (
            "user@example.com",
            None,
            200,
            {"message": "User confirmed successfully"}
        ),
        # 2) User not found => 404
        (
            "missing@user.com",
            "UserNotFoundException",
            404,
            {"errorType": "UserNotFound"}
        ),
        # 3) Not authorized => 403
        (
            "restricted@user.com",
            "NotAuthorizedException",
            403,
            {"errorType": "NotAuthorized"}
        )
    ]
)
def test_confirm_user(
    mock_ssm_and_cognito,
    email,
    side_effect,
    expected_status,
    expected_body
):
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # If there's a side effect, raise that exception
    if side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        mock_cognito_client.admin_confirm_sign_up.side_effect = exception_class()

    from index import confirm_user

    start_time = time.time()
    response = confirm_user(email)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_confirm_user] email={email}, "
        f"status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Basic performance check
    assert execution_time < 0.5, "Function took too long!"

    # Verify status code
    assert response["statusCode"] == expected_status

    # Check body
    body = json.loads(response["body"])

    if expected_status == 200:
        assert body["message"] == "User confirmed successfully"
    else:
        # For error scenarios, ensure we have some errorType or relevant message
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]
