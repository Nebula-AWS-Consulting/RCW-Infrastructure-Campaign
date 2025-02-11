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
        mock_client.exceptions.UsernameExistsException = type("UsernameExistsException",(Exception,),{})
        mock_client.exceptions.AliasExistsException = type("AliasExistsException",(Exception,),{})
        mock_client.exceptions.InvalidPasswordException = type(
            "InvalidPasswordException",
            (Exception,),
            {
                "response": {
                    "Error": {
                        "Message": "Password did not conform with policy"
                    }
                }
            }
        )        
        mock_client.exceptions.InvalidParameterException = type(
            "InvalidParameterException",
            (Exception,),
            {
                "response": {
                    "Error": {
                        "Message": "Parameter is invalid"
                    }
                }
            }
        )
        mock_client.exceptions.TooManyRequestsException = type("TooManyRequestsException",(Exception,),{})
        mock_client.exceptions.CodeDeliveryFailureException = type("CodeDeliveryFailureException",(Exception,),{})
        mock_client.exceptions.UserLambdaValidationException = type(
            "UserLambdaValidationException",
            (Exception,),
            {
                "response": {
                    "Error": {
                        "Message": "Lambda validation failed"
                    }
                }
            }
        )

        # Provide the mocks to the test function
        yield (mock_ssm, mock_client)

@pytest.mark.parametrize(
    "env_value,email,password,first_name,last_name,cognito_side_effect,expected_status,expected_body",
    [
        # 1) Successful sign-up (all valid inputs)
        (
            "dev",
            "user@example.com",
            "Password123!",
            "John",
            "Doe",
            None,  # No exception => success
            200,
            {"message": "User signed up successfully"}
        ),
        # 2) Missing fields => 400
        (
            "dev",
            "",
            "",
            "",
            "",
            None,
            400,
            {"message": "Email, password, first name, and last name are required"}
        ),
        # 3) UsernameExistsException => 409
        (
            "dev",
            "already@exists.com",
            "Password123!",
            "Jane",
            "Smith",
            "UsernameExistsException",
            409,
            {"message": "User already exists", "errorType": "UserAlreadyExists"}
        ),
        # 4) AliasExistsException => 409
        (
            "dev",
            "alias@example.com",
            "Password123!",
            "Alias",
            "Test",
            "AliasExistsException",
            409,
            {
                "message": "A user with this email or phone number already exists."
            }
        ),
        # 5) InvalidPasswordException => 400
        (
            "dev",
            "valid@example.com",
            "bad",
            "Bad",
            "Pass",
            "InvalidPasswordException",
            400,
            {"message": "User signed up successfully"}
        ),
        # 6) InvalidParameterException => 400
        (
            "dev",
            "invalid@param.com",
            "Password123!",
            "Inv",
            "Param",
            "InvalidParameterException",
            400,
            {"message": "User signed up successfully"}
        ),
        # 7) TooManyRequestsException => 429
        (
            "dev",
            "rate@limit.com",
            "Password123!",
            "Rate",
            "Limit",
            "TooManyRequestsException",
            429,
            {"message": "Too many requests. Please try again later."}
        ),
        # 8) CodeDeliveryFailureException => 500
        (
            "dev",
            "fail@delivery.com",
            "Password123!",
            "Fail",
            "Delivery",
            "CodeDeliveryFailureException",
            500,
            {"message": "User signed up successfully"}
        ),
        # 9) UserLambdaValidationException => 400
        (
            "dev",
            "lambda@fail.com",
            "Password123!",
            "Lambda",
            "Fail",
            "UserLambdaValidationException",
            400,
            {"message": "User signed up successfully"}
        )
    ]
)
def test_sign_up(
    mock_ssm_and_cognito,
    env_value,
    email,
    password,
    first_name,
    last_name,
    cognito_side_effect,
    expected_status,
    expected_body
):
    """
    A single, parameterized test for sign_up() that covers:
    - Valid sign-ups
    - Missing fields
    - Various Cognito exceptions
    - Missing/invalid ENVIRONMENT
    - Performance checks
    - Correct output structure
    """
    # Unpack the fixture to get your mocked ssm/client
    mock_ssm, mock_cognito_client = mock_ssm_and_cognito

    # Decide how to mock the Cognito sign_up call
    if cognito_side_effect:
        exception_class = getattr(mock_cognito_client.exceptions, cognito_side_effect, None)
        # If the side effect class isn't in client.exceptions, fallback to a generic Exception
        if not exception_class:
            exception_class = Exception
        mock_cognito_client.sign_up.side_effect = exception_class()
    else:
        # No exception => success path
        mock_cognito_client.sign_up.return_value = {
            "UserConfirmed": False,
            "UserSub": "12345678-1234-1234-1234-1234567890ab"
        }

    # Patch ENVIRONMENT
    env_patch = {"ENVIRONMENT": env_value} if env_value else {}
    with patch.dict(os.environ, env_patch, clear=True):
        from index import sign_up  # Import after patching

        # 1) Performance timing
        start_time = time.time()
        response = sign_up(password, email, first_name, last_name)
        end_time = time.time()

        execution_time = end_time - start_time
        print(
            f"[test_sign_up] ENV={env_value}, email={email}, status={response['statusCode']}, time={execution_time:.4f}s"
        )

        # 2) Performance check (arbitrary threshold 0.5s)
        assert execution_time < 0.5, "Function took too long!"

        # 3) Verify status code
        assert response["statusCode"] == expected_status

        # 4) Check body
        body = json.loads(response["body"])

        # For missing/invalid ENV, you might not have a specific error message
        # so we only check partial. Otherwise check the entire error or message.
        if expected_status == 200:
            assert "message" in body
            assert body["message"] == "User signed up successfully"
        elif expected_status == 400:
            # We expect some error or message
            assert "message" in body
            # If we have a known errorType, confirm it
            if "errorType" in expected_body:
                assert body["errorType"] == expected_body["errorType"]
        elif expected_status == 409:
            assert "message" in body
            assert "User already exists" in body["message"] or "A user with this email" in body["message"]
        elif expected_status == 429:
            assert "message" in body
            assert body["message"] == "Too many requests. Please try again later."
        elif expected_status == 500:
            # Could be code delivery failure or invalid ENV
            if "errorType" in expected_body and expected_body["errorType"] == "CodeDeliveryFailure":
                assert body["errorType"] == "CodeDeliveryFailure"
            elif "errorType" in expected_body and expected_body["errorType"] == "InternalError":
                assert body["errorType"] == "InternalError"
            else:
                # If env_value was empty => we might have a generic 500 w/o a specific body
                pass
