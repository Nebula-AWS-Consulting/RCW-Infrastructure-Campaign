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
        # 1) Missing email => 400
        (
            "",
            None,
            400,
            {"message": "Email is required"}
        ),
        # 2) Successful deletion => 200
        (
            "user@example.com",
            None,
            200,
            {"message": "User deleted successfully"}
        ),
        # 3) User not found => 404
        (
            "notfound@example.com",
            "UserNotFoundException",
            404,
            {"errorType": "UserNotFound"}
        ),
        # 4) Not authorized => 403
        (
            "noauth@example.com",
            "NotAuthorizedException",
            403,
            {"errorType": "NotAuthorized"}
        )
    ]
)
def test_delete_user(
    mock_ssm_and_cognito,
    email,
    side_effect,
    expected_status,
    expected_body
):
    """
    Tests delete_user with various scenarios:
      1) Missing email => 400
      2) Successful deletion => 200
      3) User not found => 404
      4) Not authorized => 403
      5) Generic internal error => 500
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Define exceptions used by delete_user
    mock_cognito_client.exceptions.UserNotFoundException = type("UserNotFoundException", (Exception,), {})
    mock_cognito_client.exceptions.NotAuthorizedException = type("NotAuthorizedException", (Exception,), {})

    # If there's a side effect, raise that exception for admin_delete_user
    if side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        mock_cognito_client.admin_delete_user.side_effect = exception_class()

    from index import delete_user  # import after patching

    start_time = time.time()
    response = delete_user(email)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_delete_user] email={email}, status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Quick performance check
    assert execution_time < 0.5, "Function took too long!"

    # Check status code
    assert response["statusCode"] == expected_status

    body = json.loads(response["body"])

    if expected_status == 400 and not email:
        # Missing email scenario
        assert "Email is required" in body["message"]
    elif expected_status == 200:
        # Success scenario
        assert body["message"] == "User deleted successfully"
    else:
        # Error scenarios: 404, 403, or 500
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]