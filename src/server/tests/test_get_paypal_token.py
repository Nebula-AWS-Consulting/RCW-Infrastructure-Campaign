import os
import sys
import time  # For measuring performance
import pytest
import json
import requests
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.mark.parametrize(
    "status_code, response_json, side_effect, expected_return_type, expected_status, expected_error_type",
    [
        # 1) Success (200) => returns just the access_token string
        (
            200,
            {"access_token": "fake-token-123"},
            None,
            "token",
            None,
            None
        ),
        # 2) PayPal error response => e.g., 400
        (
            400,
            {"error": "invalid_client", "error_description": "Client credentials are invalid"},
            None,
            "dict",
            400,
            "PayPalAPIError"
        ),
        # 3) Timeout => requests.exceptions.Timeout
        (
            None,
            None,
            requests.exceptions.Timeout,
            "dict",
            504,
            "TimeoutError"
        ),
        # 4) ConnectionError => requests.exceptions.ConnectionError
        (
            None,
            None,
            requests.exceptions.ConnectionError,
            "dict",
            503,
            "ConnectionError"
        ),
        # 5) RequestException => e.g. requests.exceptions.HTTPError
        (
            None,
            None,
            requests.exceptions.RequestException,
            "dict",
            500,
            "RequestError"
        ),
        # 6) Generic exception => e.g. ValueError
        (
            None,
            None,
            ValueError,
            "dict",
            500,
            "InternalError"
        ),
    ]
)
@patch("index.get_paypal_client_id", return_value="test-client-id")
@patch("index.get_paypal_secret", return_value="test-secret")
@patch("index.requests.post")  # Adjust "index" to the actual module where your function is defined
def test_get_paypal_access_token(
    mock_post,       # the requests.post patch
    mock_secret,     # the get_paypal_secret patch
    mock_client_id,  # the get_paypal_client_id patch
    status_code,
    response_json,
    side_effect,
    expected_return_type,
    expected_status,
    expected_error_type
):
    """
    Tests get_paypal_access_token with multiple scenarios:
      1) Success (200)
      2) Error from PayPal (400, 401, etc.)
      3) Timeout
      4) ConnectionError
      5) RequestException
      6) Generic exception
    """

    # If side_effect is set, have mock_post raise that exception
    if side_effect:
        mock_post.side_effect = side_effect
    else:
        mock_response = MagicMock()
        mock_response.status_code = status_code
        mock_response.json.return_value = response_json
        mock_post.return_value = mock_response

    from index import get_paypal_access_token  # Import AFTER patching

    start_time = time.time()
    result = get_paypal_access_token()
    end_time = time.time()
    execution_time = end_time - start_time

    # Print performance info
    print(
        f"[test_get_paypal_access_token] status_code={status_code}, side_effect={side_effect}, "
        f"expected_return={expected_return_type}, time={execution_time:.6f}s"
    )

    # If the call was successful, we expect a string token
    if expected_return_type == "token":
        assert isinstance(result, str)
        assert result == "fake-token-123"
    # Otherwise, we expect a dict-like object (from cors_response) with statusCode and body
    else:
        assert isinstance(result, dict), "Expected a dict (from cors_response) for error cases"
        assert "statusCode" in result
        assert "body" in result

        assert result["statusCode"] == expected_status, f"Expected {expected_status}, got {result['statusCode']}"

        # Check errorType if we have one
        if expected_error_type:
            body_data = json.loads(result["body"])
            assert body_data["errorType"] == expected_error_type
