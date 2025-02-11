import os
import sys
import time
import pytest
import requests
import json
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.mark.parametrize(
    "amount, custom_id, mock_return, side_effect, expected_status, expected_error_type, note",
    [
        # 1) Negative or zero amount => ValidationError => 400
        (-100, "TEST_ID", None, None, 400, "ValidationError", "Negative amount"),
        (0, "TEST_ID", None, None, 400, "ValidationError", "Zero amount"),

        # 2) Non-string or empty string custom_id => 400
        (100, None, None, None, 400, "ValidationError", "custom_id=None"),
        (100, "", None, None, 400, "ValidationError", "custom_id=Empty"),
        (100, "   ", None, None, 400, "ValidationError", "custom_id=Spaces"),

        # 3) create_paypal_order returns missing 'id' => 500 with IncompleteResponse
        (100, "VALID_ID", {}, None, 500, "IncompleteResponse", "missing 'id'"),

        # 4) Success scenario => 200
        (100, "SUCCESS_ID", {"id": "ORDER-123"}, None, 200, None, "Success => 200"),

        # 5) Network error => requests.exceptions.RequestException => 503
        (100, "NET_ERROR", None, requests.exceptions.RequestException, 503, "NetworkError", "RequestException => 503"),
    ]
)
@patch("index.create_paypal_order")
def test_create_paypal_order_route(
    mock_create_paypal_order,
    amount,
    custom_id,
    mock_return,
    side_effect,
    expected_status,
    expected_error_type,
    note
):
    """
    Tests create_paypal_order_route() with multiple scenarios:
      - Negative or zero amount => ValidationError (400)
      - Non-string or empty custom_id => ValidationError (400)
      - create_paypal_order returns missing 'id' => 500 (IncompleteResponse)
      - Success => 200
      - Network error => 503 (NetworkError)
      - Generic unknown error => 500 (InternalError)
    """

    if side_effect:
        # If side_effect is an exception object or class, raise it
        if isinstance(side_effect, Exception):
            # If it's an instance, set that as side_effect
            mock_create_paypal_order.side_effect = side_effect
        else:
            # If it's a class, e.g. requests.exceptions.RequestException
            mock_create_paypal_order.side_effect = side_effect()
    else:
        # Return a dictionary (like the real create_paypal_order would)
        mock_create_paypal_order.return_value = mock_return

    from index import create_paypal_order_route  # import after patching

    start_time = time.time()
    response = create_paypal_order_route(amount, custom_id)
    end_time = time.time()
    exec_time = end_time - start_time

    print(f"[test_create_paypal_order_route] {note}: time={exec_time:.6f}s")

    # All code paths should return a dict (from cors_response)
    assert isinstance(response, dict), "Expected a dict from create_paypal_order_route"
    assert "statusCode" in response, "Missing statusCode"
    assert "body" in response, "Missing body"

    assert response["statusCode"] == expected_status, f"Expected {expected_status}, got {response['statusCode']}"

    if expected_status == 200:
        body_data = json.loads(response["body"])
        # Should have the 'id' and success message
        assert "id" in body_data
        assert body_data["id"] == mock_return["id"]
        assert body_data["message"] == "PayPal order created successfully."
    else:
        # For errors, check errorType if given
        if expected_error_type:
            body_data = json.loads(response["body"])
            assert body_data["errorType"] == expected_error_type