import os
import sys
import time
import pytest
import requests
import json
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.mark.parametrize(
    "access_token, status_code, response_json, side_effect, expected_result_type, expected_status, expected_error_type, note",
    [
        # 1) Missing token => 500 AccessTokenError
        (
            None,  # No token
            None,
            None,
            None,
            "dict",  # returns cors_response
            500,
            "AccessTokenError",
            "No access token => 500"
        ),
        # 2) Success => 201 with valid product_id
        (
            "fake-token",
            201,
            {"id": "PROD-123", "name": "Donation Product"},
            None,
            "string",  # returns product_id (string)
            None,
            None,
            "Success => 201 => returns product_id"
        ),
        # 3) 201 but missing 'id'
        (
            "fake-token",
            201,
            {"name": "Donation Product"},  # no 'id'
            None,
            "dict",
            500,
            "IncompleteResponse",
            "201 but missing id => 500"
        ),
        # 4) PayPal error => e.g. 400
        (
            "fake-token",
            400,
            {"name": "INVALID_REQUEST", "message": "Something went wrong"},
            None,
            "dict",
            400,
            "PayPalAPIError",
            "PayPal error => 400"
        ),
        # 5) Timeout => 504
        (
            "fake-token",
            None,
            None,
            requests.exceptions.Timeout,
            "dict",
            504,
            "TimeoutError",
            "Timeout => 504"
        ),
        # 6) ConnectionError => 503
        (
            "fake-token",
            None,
            None,
            requests.exceptions.ConnectionError,
            "dict",
            503,
            "ConnectionError",
            "ConnectionError => 503"
        ),
        # 7) RequestException => 500
        (
            "fake-token",
            None,
            None,
            requests.exceptions.RequestException,
            "dict",
            500,
            "RequestError",
            "RequestException => 500"
        ),
        # 8) Generic unknown exception => 500
        (
            "fake-token",
            None,
            None,
            ValueError,  # for example
            "dict",
            500,
            "InternalError",
            "Generic => 500"
        ),
    ]
)
@patch("index.get_paypal_access_token", autospec=True)
@patch("index.requests.post", autospec=True)
def test_create_paypal_product(
    mock_post,
    mock_get_token,
    access_token,
    status_code,
    response_json,
    side_effect,
    expected_result_type,
    expected_status,
    expected_error_type,
    note
):
    """
    Tests create_paypal_product() with multiple scenarios:
      1) Missing token => 500 (AccessTokenError)
      2) Success => 201 (returns product_id string)
      3) 201 but missing 'id' => 500 (IncompleteResponse)
      4) PayPal error => e.g. 400 => PayPalAPIError
      5) Timeout => 504
      6) ConnectionError => 503
      7) RequestException => 500
      8) Generic exception => 500
    """
    # Mock token return
    mock_get_token.return_value = access_token

    if side_effect:
        mock_post.side_effect = side_effect
    else:
        # Return a mock response with status_code & JSON
        mock_response = MagicMock()
        mock_response.status_code = status_code
        mock_response.json.return_value = response_json or {}
        mock_post.return_value = mock_response

    from index import create_paypal_product  # Import after patching

    start_time = time.time()
    result = create_paypal_product()
    end_time = time.time()
    exec_time = end_time - start_time

    # Print performance info
    print(f"[test_create_paypal_product] {note}: time={exec_time:.6f}s")

    # If we expect "string" => the function returned product_id
    if expected_result_type == "string":
        assert isinstance(result, str), f"Expected string product_id, got {type(result)}"
        assert result == "PROD-123"
    else:
        # Otherwise, we expect a cors_response dict
        assert isinstance(result, dict), "Expected a dict from cors_response"

        # Check statusCode if expected
        if expected_status is not None:
            assert "statusCode" in result, "Missing statusCode in cors_response"
            assert result["statusCode"] == expected_status, f"Got {result['statusCode']} != {expected_status}"

        # Check errorType if needed
        if expected_error_type:
            body = json.loads(result["body"])
            assert body["errorType"] == expected_error_type