import os
import sys
import time
import json
import pytest
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class MockSESContainer:
    """
    A small container to hold all the mocks from the fixture,
    so we can reference them as .ses, .ssm, etc. instead of a tuple.
    """
    def __init__(self, ses_mock, ssm_mock, sender_mock, recipient_mock):
        self.ses = ses_mock
        self.ssm = ssm_mock
        self.sender = sender_mock
        self.recipient = recipient_mock

@pytest.fixture
def mock_ses_client():
    """
    Fixture that patches index.ses plus ssm, get_sender_email, get_recipient_email.
    Returns a MockSESContainer with .ses, .ssm, .sender, .recipient references.
    """
    with patch("index.ses") as mock_ses, \
         patch('index.ssm') as mock_ssm, \
         patch("index.get_sender_email") as mock_sender, \
         patch("index.get_recipient_email") as mock_recipient:

        # Mock SSM to return a fake user pool ID
        mock_ssm.get_parameter.return_value = {
            "Parameter": {"Value": "fake_user_pool_id"}
        }

        # Define SES exceptions on mock_ses
        mock_ses.exceptions = type("mock_exceptions", (), {})()
        mock_ses.exceptions.MessageRejected = type("MessageRejected", (Exception,), {})
        mock_ses.exceptions.MailFromDomainNotVerifiedException = type("MailFromDomainNotVerifiedException", (Exception,), {})
        mock_ses.exceptions.ConfigurationSetDoesNotExistException = type("ConfigurationSetDoesNotExistException", (Exception,), {})

        yield MockSESContainer(mock_ses, mock_ssm, mock_sender, mock_recipient)

@pytest.mark.parametrize(
    "first_name, email, message, side_effect, expected_status, expected_body",
    [
        # 1) Missing fields => 400
        (
            "",  # missing first name
            "user@example.com",
            "Hello!",
            None,
            400,
            {"message": "All fields are required: name, email, and message."}
        ),
        (
            "John",
            "",
            "Hello!",
            None,
            400,
            {"message": "All fields are required: name, email, and message."}
        ),
        (
            "John",
            "user@example.com",
            "",
            None,
            400,
            {"message": "All fields are required: name, email, and message."}
        ),
        # 2) Successful send => 200
        (
            "John",
            "john@example.com",
            "Hello, this is a test message.",
            None,
            200,
            {"message": "Message sent successfully."}
        ),
        # 3) Message rejected => 400
        (
            "Jane",
            "jane@invalid-domain.com",
            "Test message",
            "MessageRejected",
            400,
            {"errorType": "MessageRejected"}
        ),
        # 4) MailFromDomainNotVerifiedException => 400
        (
            "Jack",
            "jack@example.com",
            "Another test message",
            "MailFromDomainNotVerifiedException",
            400,
            {"errorType": "EmailNotVerified"}
        ),
        # 5) ConfigurationSetDoesNotExistException => 500
        (
            "Jill",
            "jill@example.com",
            "Configuration set error",
            "ConfigurationSetDoesNotExistException",
            500,
            {"errorType": "ConfigurationError"}
        )
    ]
)
def test_contact_us(
    mock_ses_client,
    first_name,
    email,
    message,
    side_effect,
    expected_status,
    expected_body
):
    """
    Tests contact_us with various scenarios:
      1) Missing fields => 400
      2) Successful send => 200
      3) MessageRejected => 400
      4) MailFromDomainNotVerifiedException => 400
      5) ConfigurationSetDoesNotExistException => 500
    """
    # Access mocks from the container
    mock_ses = mock_ses_client.ses
    # mock_ses_client.ssm, mock_ses_client.sender, mock_ses_client.recipient also available if needed

    # If there's a side effect, raise that exception on send_email
    if side_effect:
        exception_class = getattr(mock_ses.exceptions, side_effect, Exception)
        mock_ses.send_email.side_effect = exception_class()

    # Import the function after patching
    from index import contact_us

    start_time = time.time()
    response = contact_us(first_name, email, message)
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"[test_contact_us] name={first_name}, email={email}, message={message}, "
        f"status={response['statusCode']}, time={execution_time:.4f}s"
    )

    # Quick performance check
    assert execution_time < 0.5, "Function took too long!"

    # Check status
    assert response["statusCode"] == expected_status

    # Parse body
    body = json.loads(response["body"])

    if expected_status == 200:
        # Success scenario
        assert body["message"] == "Message sent successfully."
    elif expected_status == 400 and not all([first_name, email, message]):
        # Missing fields scenario
        assert "All fields are required" in body["message"]
    else:
        # Error scenarios
        if "errorType" in expected_body:
            assert body["errorType"] == expected_body["errorType"]