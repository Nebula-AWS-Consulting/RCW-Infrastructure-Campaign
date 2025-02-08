import os
import sys
import time
import pytest
import requests
import json
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.mark.parametrize(
    "plan_id, custom_id, token, status_code, response_json, side_effect, expected_status, expected_error_type, note",
    [
        # 1) Missing plan_id => ValidationError => 400
        (
            "",  # empty plan_id
            "CUSTOM-123",
            None,
            None,
            None,
            None,
            400,
            "ValidationError",
            "No plan_id => 400"
        ),
        # 2) Missing custom_id => ValidationError => 400
        (
            "PLAN-ABC",
            "",
            None,
            None,
            None,
            None,
            400,
            "ValidationError",
            "No custom_id => 400"
        ),
        # 3) Missing token => 500 AccessTokenError
        (
            "PLAN-ABC",
            "CUSTOM-123",
            None,  # no token
            None,
            None,
            None,
            500,
            "AccessTokenError",
            "No access token => 500"
        ),
        # 4) Success => 201 => return { subscription: ... }
        (
            "PLAN-ABC",
            "CUSTOM-123",
            "fake-token",
            201,
            {"id": "I-SUBSCRIPTION-ID", "status": "ACTIVE"},
            None,
            201,
            None,
            "Success => 201"
        ),
        # 5) PayPal error => e.g. 400
        (
            "PLAN-ABC",
            "CUSTOM-123",
            "fake-token",
            400,
            {"name": "INVALID_REQUEST", "message": "Something is wrong"},
            None,
            400,
            "PayPalAPIError",
            "PayPal error => 4xx"
        ),
        # 6) Timeout => 504
        (
            "PLAN-ABC",
            "CUSTOM-123",
            "fake-token",
            None,
            None,
            requests.exceptions.Timeout,
            504,
            "TimeoutError",
            "Timeout => 504"
        ),
        # 7) ConnectionError => 503
        (
            "PLAN-ABC",
            "CUSTOM-123",
            "fake-token",
            None,
            None,
            requests.exceptions.ConnectionError,
            503,
            "ConnectionError",
            "ConnectionError => 503"
        ),
        # 8) RequestException => 500
        (
            "PLAN-ABC",
            "CUSTOM-123",
            "fake-token",
            None,
            None,
            requests.exceptions.RequestException,
            500,
            "RequestError",
            "RequestException => 500"
        ),
        # 9) Generic unknown exception => 500
        (
            "PLAN-ABC",
            "CUSTOM-123",
            "fake-token",
            None,
            None,
            ValueError,  # or any random exception
            500,
            "InternalError",
            "Generic => 500"
        ),
    ]
)
@patch("index.get_paypal_access_token", autospec=True)
@patch("index.requests.post", autospec=True)
def test_create_paypal_subscription(
    mock_post,
    mock_get_token,
    plan_id,
    custom_id,
    token,
    status_code,
    response_json,
    side_effect,
    expected_status,
    expected_error_type,
    note
):
    """
    Tests create_paypal_subscription(plan_id, custom_id) with multiple scenarios:
      1) Missing plan_id => 400
      2) Missing custom_id => 400
      3) Missing token => 500 (AccessTokenError)
      4) Success => 201 => returns subscription object
      5) PayPal error => e.g. 400 => PayPalAPIError
      6) Timeout => 504
      7) ConnectionError => 503
      8) RequestException => 500
      9) Generic unknown => 500
    """
    mock_get_token.return_value = token

    if side_effect:
        mock_post.side_effect = side_effect
    else:
        mock_response = MagicMock()
        if status_code:
            mock_response.status_code = status_code
        else:
            mock_response.status_code = 200  # default if not provided
        mock_response.json.return_value = response_json or {}
        mock_post.return_value = mock_response

    from index import create_paypal_subscription  # import after patching

    start_time = time.time()
    response = create_paypal_subscription(plan_id, custom_id)
    end_time = time.time()
    exec_time = end_time - start_time

    print(f"[test_create_paypal_subscription] {note}: time={exec_time:.6f}s")

    # Always expect a dict from cors_response (even on success)
    assert isinstance(response, dict), "Expected a dict from cors_response"

    # Check status
    assert "statusCode" in response, "Missing statusCode in response"
    assert "body" in response, "Missing body in response"

    assert response["statusCode"] == expected_status, (
        f"Got {response['statusCode']}, expected {expected_status}"
    )

    # Parse the JSON body
    body_data = json.loads(response["body"])

    # If success => 201 => we expect "subscription" in the body
    if expected_status == 201:
        assert "subscription" in body_data
        # Optionally check subscription["id"] or other fields
    elif expected_error_type:
        # For error scenarios, check the errorType
        assert body_data["errorType"] == expected_error_type