import os
import sys
import time
import pytest
import json
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.mark.parametrize(
    "amount, custom_id, product_return, plan_return, subscription_return,"
    " product_side_effect, plan_side_effect, sub_side_effect,"
    " expected_status, expected_error_type, note",
    [
        # 1) amount <= 0 => 400 ValidationError
        (
            0, "CUSTOM_ID", None, None, None,
            None, None, None,
            400, "ValidationError",
            "Zero amount => 400"
        ),
        (
            -5, "CUSTOM_ID", None, None, None,
            None, None, None,
            400, "ValidationError",
            "Negative amount => 400"
        ),

        # 2) custom_id empty => 400 ValidationError
        (
            10, "", None, None, None,
            None, None, None,
            400, "ValidationError",
            "Empty custom_id => 400"
        ),
        (
            10, "   ", None, None, None,
            None, None, None,
            400, "ValidationError",
            "Blank custom_id => 400"
        ),

        # 3) create_paypal_product() => None => 500 ProductCreationError
        (
            10, "CUSTOM_ID", None, None, None,
            None, None, None,
            500, "ProductCreationError",
            "product_id=None => 500"
        ),

        # 4) create_paypal_plan() => None => 500 PlanCreationError
        (
            10, "CUSTOM_ID", "PROD-123", None, None,
            None, None, None,
            500, "PlanCreationError",
            "plan_id=None => 500"
        ),

        # 5) create_paypal_subscription() => missing 'id' => 500 IncompleteResponse
        (
            10, "CUSTOM_ID", "PROD-123", "PLAN-999", {},
            None, None, None,
            500, "IncompleteResponse",
            "Subscription missing id => 500"
        ),

        # 6) subscription has 'id' but missing approval link => 500 IncompleteResponse
        (
            10, "CUSTOM_ID", "PROD-123", "PLAN-999",
            {"id": "SUB-001", "links": [{"rel": "other", "href": "..." }]},
            None, None, None,
            500, "IncompleteResponse",
            "Subscription missing approval link => 500"
        ),

        # 7) Success => 200
        (
            10, "CUSTOM_ID", "PROD-123", "PLAN-999",
            {
                "id": "SUB-002",
                "links": [
                    {"rel": "approve", "href": "https://paypal.com/approval-link"},
                    {"rel": "self", "href": "https://paypal.com/self-link"}
                ]
            },
            None, None, None,
            200, None,
            "Success => 200"
        ),

        # 8) create_paypal_product raises ValueError => 400 ValidationError
        (
            10, "CUSTOM_ID", None, None, None,
            ValueError("Something invalid"), None, None,
            400, "ValidationError",
            "ValueError => 400"
        ),

        # 9) create_paypal_subscription raises a random Exception => 500 InternalError
        (
            10, "CUSTOM_ID", "PROD-123", "PLAN-999", None,
            None, None, Exception("Unknown error"),
            500, "InternalError",
            "Generic Exception => 500"
        ),
    ]
)
@patch("index.create_paypal_subscription", autospec=True)
@patch("index.create_paypal_plan", autospec=True)
@patch("index.create_paypal_product", autospec=True)
def test_create_paypal_subscription_route(
    mock_create_product,
    mock_create_plan,
    mock_create_sub,
    amount,
    custom_id,
    product_return,
    plan_return,
    subscription_return,
    product_side_effect,
    plan_side_effect,
    sub_side_effect,
    expected_status,
    expected_error_type,
    note
):
    """
    Tests create_paypal_subscription_route(amount, custom_id) with various scenarios:
      1) Invalid amount => 400
      2) Invalid custom_id => 400
      3) create_paypal_product => None => 500
      4) create_paypal_plan => None => 500
      5) Subscription missing 'id' => 500
      6) Missing approval link => 500
      7) Success => 200
      8) ValueError => 400
      9) Generic Exception => 500
    """

    # Setup returns/side_effects for each mocked function
    if product_side_effect:
        mock_create_product.side_effect = product_side_effect
    else:
        mock_create_product.return_value = product_return

    if plan_side_effect:
        mock_create_plan.side_effect = plan_side_effect
    else:
        mock_create_plan.return_value = plan_return

    if sub_side_effect:
        mock_create_sub.side_effect = sub_side_effect
    else:
        mock_create_sub.return_value = subscription_return

    from index import create_paypal_subscription_route  # import after patching

    start_time = time.time()
    response = create_paypal_subscription_route(amount, custom_id)
    end_time = time.time()
    exec_time = end_time - start_time

    print(f"[test_create_paypal_subscription_route] {note}: time={exec_time:.6f}s")

    # Should always return a dict from cors_response
    assert isinstance(response, dict), "Expected a dict from cors_response"
    assert "statusCode" in response, "Missing statusCode"
    assert "body" in response, "Missing body"

    assert response["statusCode"] == expected_status, f"Got {response['statusCode']}, expected {expected_status}"

    if expected_error_type:
        body_data = json.loads(response["body"])
        assert body_data["errorType"] == expected_error_type, f"Got {body_data['errorType']}, expected {expected_error_type}"
    elif expected_status == 200:
        # check success shape
        body_data = json.loads(response["body"])
        assert body_data["subscription_id"] == "SUB-002"
        assert body_data["approval_url"] == "https://paypal.com/approval-link"
        assert body_data["message"] == "PayPal subscription created successfully."