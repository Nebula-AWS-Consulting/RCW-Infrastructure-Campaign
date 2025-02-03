import os
import time
from unittest.mock import patch
import pytest
import json

#
# Test 1: Basic SSM Patch
#
@patch.dict(os.environ, {"ENVIRONMENT": "test"}, clear=True)  # ensures environment != None
@patch('index.ssm')  # patch SSM in index.py
def test_log_in_with_mocked_ssm(mock_ssm):
    mock_ssm.get_parameter.return_value = {
        "Parameter": {"Value": "fake_user_pool_id"}
    }

    from index import log_in  # Now environment = "test", ssm is mocked

    # Just a simple check that the function doesn't blow up
    response = log_in("test@example.com", "testpassword")
    assert response['statusCode'] in [200, 401, 404, 500]

#
# Test 2: Mock SSM + Mock Cognito
#
@patch.dict(os.environ, {"ENVIRONMENT": "test"}, clear=True)
@patch('index.ssm')
@patch('index.client')
def test_log_in_success_cognito(mock_client, mock_ssm):
    # 1) Mock SSM
    mock_ssm.get_parameter.return_value = {
        "Parameter": {"Value": "fake_user_pool_id"}
    }

    # 2) Define fake exception classes on your mock client
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

    fake_jwt = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."  # header
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwidGVzdCI6InRva2VuIn0."  # payload
    "h0QQR0mhHDnFYnA54zKRlkp8qPgHNDaTaLz-MBslc5k"       # signature
)

    # 3) Mock Cognito's initiate_auth success response
    mock_client.initiate_auth.return_value = {
        "AuthenticationResult": {
            "IdToken": f"{fake_jwt}",
            "AccessToken": "fake-access-token",
            "RefreshToken": "fake-refresh-token"
        }
    }

    from index import log_in

    start_time = time.time()
    response = log_in("test@example.com", "testpassword")
    end_time = time.time()
    execution_time = end_time - start_time

    print(f"test_log_in_success execution time: {execution_time:.6f} seconds")

    assert response['statusCode'] == 200
    response_body = json.loads(response['body'])
    assert response_body["id_token"].startswith("eyJhbGciOiJIUzI1Ni")    
    assert "fake-access-token" in response['body']
    assert "fake-refresh-token" in response['body']
    assert execution_time < 0.5


#
# Test 3: Missing Credentials
#
@patch.dict(os.environ, {"ENVIRONMENT": "test"}, clear=True)
@patch('index.ssm')
def test_log_in_missing_credentials(mock_ssm):
    mock_ssm.get_parameter.return_value = {
        "Parameter": {"Value": "fake_user_pool_id"}
    }

    from index import log_in

    start_time = time.time()
    response = log_in("", "")
    end_time = time.time()

    execution_time = end_time - start_time
    print(f"test_log_in_missing_credentials execution time: {execution_time:.6f} seconds")

    assert response['statusCode'] == 400