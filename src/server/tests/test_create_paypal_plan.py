import os
import sys
import time
import pytest
import requests
import json
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.mark.parametrize(
    "product_id, amount, token, status_code, response_json, side_effect, expected_return_type, expected_status, expected_error_type, note",
    [
        # 1) Missing product_id => ValidationError => 400
        (
            "",  # empty product_id
            10.00,
            None,
            None,
            None,
            None,
            "dict",   # returns cors_response
            400,
            "ValidationError",
            "No product_id => 400"
        ),
        # 2) amount <= 0 => 400 ValidationError
        (
            "PROD-123",
            0,
            None,
            None,
            None,
            None,
            "dict",
            400,
            "ValidationError",
            "Zero amount => 400"
        ),
        (
            "PROD-123",
            -5.00,
            None,
            None,
            None,
            None,
            "dict",
            400,
            "ValidationError",
            "Negative amount => 400"
        ),
        # 3) Missing token => 500 AccessTokenError
        (
            "PROD-123",
            10.00,
            None,    # No token
            None,
            None,
            None,
            "dict",
            500,
            "AccessTokenError",
            "No token => 500"
        ),
        # 4) Success => 201 with valid plan ID
        (
            "PROD-123",
            10.00,
            "fake-token",
            201,
            {"id": "PLAN-987", "status": "ACTIVE"},
            None,
            "string",  # returns plan_id as string
            None,
            None,
            "Success => 201 => plan_id"
        ),
        # 5) 201 but missing 'id'
        (
            "PROD-123",
            10.00,
            "fake-token",
            201,
            {"status": "ACTIVE"},
            None,
            "dict",
            500,
            "IncompleteResponse",
            "201 but no plan 'id'"
        ),
        # 6) PayPal error => e.g. 400
        (
            "PROD-123",
            10.00,
            "fake-token",
            400,
            {"name": "INVALID_REQUEST", "message": "Something went wrong"},
            None,
            "dict",
            400,
            "PayPalAPIError",
            "PayPal 4xx error"
        ),
        # 7) Timeout => 504
        (
            "PROD-123",
            10.00,
            "fake-token",
            None,
            None,
            requests.exceptions.Timeout,
            "dict",
            504,
            "TimeoutError",
            "Timeout => 504"
        ),
        # 8) ConnectionError => 503
        (
            "PROD-123",
            10.00,
            "fake-token",
            None,
            None,
            requests.exceptions.ConnectionError,
            "dict",
            503,
            "ConnectionError",
            "ConnectionError => 503"
        ),
        # 9) Generic RequestException => 500
        (
            "PROD-123",
            10.00,
            "fake-token",
            None,
            None,
            requests.exceptions.RequestException,
            "dict",
            500,
            "RequestError",
            "RequestException => 500"
        ),
        # 10) Generic unknown exception => 500
        (
            "PROD-123",
            10.00,
            "fake-token",
            None,
            None,
            ValueError,  # or any random exception
            "dict",
            500,
            "InternalError",
            "Generic => 500"
        ),
    ]
)
@patch("index.get_paypal_access_token", autospec=True)
@patch("index.requests.post", autospec=True)
def test_create_paypal_plan(
    mock_post,
    mock_get_token,
    product_id,
    amount,
    token,
    status_code,
    response_json,
    side_effect,
    expected_return_type,
    expected_status,
    expected_error_type,
    note
):
    """
    Test create_paypal_plan(product_id, amount) across multiple scenarios:
      1) Missing product_id => 400 ValidationError
      2) Non-positive amount => 400
      3) Missing token => 500 AccessTokenError
      4) Success => 201 => returns plan_id
      5) 201 but missing 'id' => 500 IncompleteResponse
      6) PayPal error => e.g. 400 => PayPalAPIError
      7) Timeout => 504
      8) ConnectionError => 503
      9) RequestException => 500
      10) Generic unknown => 500
    """

    # Mock the get_paypal_access_token
    mock_get_token.return_value = token

    # If side_effect is set, cause mock_post to raise that exception
    if side_effect:
        mock_post.side_effect = side_effect
    else:
        # Otherwise, return a mock response
        mock_response = MagicMock()
        if status_code:
            mock_response.status_code = status_code
        else:
            mock_response.status_code = 200  # default, won't matter if side_effect isn't set

        mock_response.json.return_value = response_json or {}
        mock_post.return_value = mock_response

    from index import create_paypal_plan  # import after patching

    start_time = time.time()
    result = create_paypal_plan(product_id, amount)
    end_time = time.time()
    exec_time = end_time - start_time

    print(f"[test_create_paypal_plan] {note}: time={exec_time:.6f}s")

    # If we expect a string (like plan_id), check result
    if expected_return_type == "string":
        assert isinstance(result, str), f"Expected string plan ID, got {type(result)}"
        # If you want to confirm the exact ID
        assert result == "PLAN-987"
    else:
        # We expect a dict from cors_response
        assert isinstance(result, dict), "Expected dict (cors_response)"
        if expected_status is not None:
            assert "statusCode" in result
            assert "body" in result
            assert result["statusCode"] == expected_status, f"Got {result['statusCode']}, expected {expected_status}"

            if expected_error_type:
                body_data = json.loads(result["body"])
                assert body_data["errorType"] == expected_error_type, f"Unexpected errorType: {body_data}"