import os
import sys
import time
import pytest
import json
import requests
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.mark.parametrize(
    "access_token, status_code, response_json, side_effect, expected_status, expected_error_type, note",
    [
        # 1) No access token => 500 (AccessTokenError)
        (
            None,  # create_paypal_order sees None => immediate 500
            None,
            None,
            None,
            500,
            "AccessTokenError",
            "No token => 500"
        ),
        # 2) Success scenario => 201
        (
            "fake-access-token",
            201,
            {"id": "ORDER123", "status": "CREATED"},
            None,
            201,
            None,   # no errorType on success
            "Success => 201"
        ),
        # 3) PayPal error => e.g. 400
        (
            "fake-access-token",
            400,
            {"name": "INVALID_REQUEST", "message": "Some PayPal error"},
            None,
            400,
            "PayPalAPIError",
            "Error => 4xx"
        ),
        # 4) Timeout => 504
        (
            "fake-access-token",
            None,  # status_code is irrelevant if side_effect is raised
            None,
            requests.exceptions.Timeout,
            504,
            "TimeoutError",
            "Timeout => 504"
        ),
        # 5) ConnectionError => 503
        (
            "fake-access-token",
            None,
            None,
            requests.exceptions.ConnectionError,
            503,
            "ConnectionError",
            "ConnectionError => 503"
        ),
        # 6) Generic RequestException => 500
        (
            "fake-access-token",
            None,
            None,
            requests.exceptions.RequestException,
            500,
            "RequestError",
            "RequestException => 500"
        ),
        # 7) Generic unknown Exception => 500
        (
            "fake-access-token",
            None,
            None,
            ValueError,  # or any random Python exception
            500,
            "InternalError",
            "Generic exception => 500"
        ),
    ]
)
@patch("index.get_paypal_access_token")
@patch("index.requests.post")  # Adjust "index" to your actual module name
def test_create_paypal_order(
    mock_post,
    mock_get_token,
    access_token,
    status_code,
    response_json,
    side_effect,
    expected_status,
    expected_error_type,
    note
):
    """
    Tests create_paypal_order() with multiple scenarios:
      - Missing token => 500
      - Success => 201
      - PayPal error => 4xx or 5xx
      - Timeout => 504
      - ConnectionError => 503
      - RequestException => 500
      - Generic Exception => 500
    """
    # Mock the token return
    mock_get_token.return_value = access_token

    if side_effect:
        # Raise a requests exception (or ValueError) if side_effect is set
        mock_post.side_effect = side_effect
    else:
        # Otherwise, return a mocked response with status_code and JSON
        mock_response = MagicMock()
        mock_response.status_code = status_code
        mock_response.json.return_value = response_json or {}
        mock_post.return_value = mock_response

    from index import create_paypal_order  # Import after patching

    start_time = time.time()
    result = create_paypal_order(amount=100, custom_id="test123", currency="USD")  # Example input
    end_time = time.time()
    execution_time = end_time - start_time

    # Print performance info
    print(f"[test_create_paypal_order] {note}: time={execution_time:.6f}s")

    # Check result
    assert isinstance(result, dict), "Function should return a dict (cors_response)."
    assert "statusCode" in result, "Missing statusCode in response"
    assert "body" in result, "Missing body in response"
    assert result["statusCode"] == expected_status, f"Got {result['statusCode']} != expected {expected_status}"

    # If success => 201 => check 'order' in body
    if expected_status == 201:
        body_data = json.loads(result["body"])
        assert "order" in body_data
        assert body_data["order"].get("status") == "CREATED"
    else:
        # Error scenarios => check errorType if provided
        if expected_error_type:
            body_data = json.loads(result["body"])
            assert body_data["errorType"] == expected_error_type
