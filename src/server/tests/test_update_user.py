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
        mock_client.exceptions.InvalidParameterException = type("InvalidParameterException",(Exception,),{})


        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

@pytest.mark.parametrize(
    "email, attribute_updates, side_effect, exception_message, expected_status, expected_body",
    [
        # 1) Missing email => 400
        (
            "",
            {"custom:firstName": "John"},
            None,
            None,
            400,
            {"message": "Email is required"}
        ),
        # 2) Missing attribute_updates => 400
        (
            "user@example.com",
            {},
            None,
            None,
            400,
            {"message": "Attribute updates are required"}
        ),
        # 3) Successful update => 200
        (
            "user@example.com",
            {"custom:firstName": "Jane", "custom:lastName": "Doe"},
            None,
            None,
            200,
            {"message": "User attributes updated successfully"}
        ),
        # 4) User not found => 404
        (
            "notfound@example.com",
            {"custom:firstName": "Missing"},
            "UserNotFoundException",
            None,
            404,
            {"errorType": "UserNotFound"}
        ),
        # 5) Invalid parameter => 400, code references e.response['Error']['Message']
        (
            "invalid@user.com",
            {"custom:firstName": "Invalid"},
            "InvalidParameterException",
            "Some invalid parameter message",
            400,
            {"errorType": "InvalidParameter"}
        ),
        # 6) Not authorized => 403
        (
            "unauthorized@user.com",
            {"custom:lastName": "NotAllowed"},
            "NotAuthorizedException",
            None,
            403,
            {"errorType": "NotAuthorized"}
        )
    ]
)
def test_update_user(
    mock_ssm_and_cognito,
    email,
    attribute_updates,
    side_effect,
    exception_message,
    expected_status,
    expected_body
):
    """
    Tests update_user with various scenarios:
      1) Missing email => 400
      2) Missing attribute_updates => 400
      3) Success => 200
      4) User not found => 404
      5) Invalid parameter => 400
      6) Not authorized => 403
      7) Generic internal error => 500
    """
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Define exceptions
    mock_cognito_client.exceptions.UserNotFoundException = type("UserNotFoundException", (Exception,), {})
    mock_cognito_client.exceptions.InvalidParameterException = type("InvalidParameterException", (Exception,), {})
    mock_cognito_client.exceptions.NotAuthorizedException = type("NotAuthorizedException", (Exception,), {})

    # If there's a side effect, set it
    if side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, side_effect, Exception)
        exception_instance = exception_class()

        # If it's InvalidParameterException, set a response dict for the code to read
        if side_effect == "InvalidParameterException" and exception_message:
            setattr(exception_instance, 'response', {"Error": {"Message": exception_message}})

        mock_cognito_client.admin_update_user_attributes.side_effect = exception_instance

    from index import update_user  # import after patching

    start_time = time.time()
    response = update_user(email, attribute_updates)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_update_user] email={email}, attrs={attribute_updates}, "
        f"status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Performance check
    assert execution_time < 0.5, "Function took too long!"

    # Check status code
    assert response["statusCode"] == expected_status

    body = json.loads(response["body"])

    if expected_status in (400, 403, 404, 500):
        # Error scenarios
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]
        else:
            # e.g. Missing email or attribute updates => direct message check
            assert expected_body["message"] in body["message"]
    elif expected_status == 200:
        # Success scenario
        assert body["message"] == "User attributes updated successfully"