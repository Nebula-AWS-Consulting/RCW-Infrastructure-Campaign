import json
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

# The ID and range of a sample spreadsheet.
SAMPLE_SPREADSHEET_ID = "1Jpicnmuuuy7aS__mGb-3sLgED9vxvELrvffrDtOHWjo"
SAMPLE_RANGE_NAME = "A1:E20"


def main():
  """Shows basic usage of the Sheets API.
  Prints values from a sample spreadsheet.
  """
  creds = None
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
      flow = InstalledAppFlow.from_client_secrets_file(
          "credentials.json", SCOPES
      )
      creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
      token.write(creds.to_json())

  try:
    service = build("sheets", "v4", credentials=creds)

    test_event = (
    {
    "resource": "/paypal-webhook",
    "path": "/paypal-webhook",
    "httpMethod": "POST",
    "headers": {
      "Content-Type": "application/json",
      "User-Agent": "PayPal/IPN",
      "PayPal-Transmission-Id": "1234567890",
      "PayPal-Transmission-Time": "2021-01-01T12:00:00Z",
      "PayPal-Transmission-Sig": "abcdef1234567890",
      "PayPal-Cert-Url": "https://api.paypal.com/certs/cert.pem",
      "PayPal-Auth-Algo": "SHA256withRSA",
      "Webhook-Id": "YOUR_WEBHOOK_ID"
    },
    "body": json.dumps({
    "id": "WH-1234567890",
    "event_version": "1.0",
    "create_time": "2021-01-01T12:00:00Z",
    "resource_type": "sale",
    "event_type": "PAYMENT.SALE.COMPLETED",
    "summary": "Payment completed for $100.00 USD",
    "resource": {
      "id": "9B12345678901234L",
      "state": "completed",
      "amount": {
        "total": "100.00",
        "currency": "USD"
      },
      "payment_mode": "INSTANT_TRANSFER",
      "update_time": "2021-01-01T12:00:00Z",
      "create_time": "2021-01-01T12:00:00Z",
      "payer": {
        "email_address": "buyer@example.com",
        "payer_id": "PAYER12345",
        "payer_status": "VERIFIED",
        "country_code": "US"
      }
    },
    "links": [
      {
        "href": "https://api.paypal.com/v1/notifications/webhooks-events/WH-1234567890",
        "rel": "self",
        "method": "GET"
      },
      {
        "href": "https://api.paypal.com/v1/notifications/webhooks-events/WH-1234567890/resend",
        "rel": "resend",
        "method": "POST"
      }
    ]
  }
  ),
    "isBase64Encoded": False
  }
  
)

    body = json.loads(test_event['body'])

    payment_info = [
        body['resource']['id'],
        body['resource']['payer']['email_address'],
        body['resource']['amount']['total'],
        body['resource']['amount']['currency'],
        body['resource']['create_time']
    ]

    # Call the Sheets API
    value_range_body = {
        'values': [payment_info]
    }
    request = service.spreadsheets().values().append(
        spreadsheetId=SAMPLE_SPREADSHEET_ID,
        range=SAMPLE_RANGE_NAME,
        valueInputOption='RAW',
        body=value_range_body
    )
    response = request.execute()

    if not response:
      print("No data found.")
      return

    print(payment_info)
  except HttpError as err:
    print(err)


if __name__ == "__main__":
  main()