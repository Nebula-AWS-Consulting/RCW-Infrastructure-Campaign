import boto3
import json

# Initialize the Cognito Identity Provider client
client = boto3.client('cognito-idp', region_name='us-west-1')

# Configuration
USER_POOL_ID = "us-west-1_lJ8JcxPXT"  # Replace with your Cognito User Pool ID
CLIENT_ID = "2p3glok5k66cvh7hhs8lnpegsc"  # Replace with your Cognito App Client ID


def lambda_handler(event, context):
    try:
        # Determine the HTTP method and path from the event
        http_method = event['httpMethod']
        resource_path = event['path']

        # Parse the input body if available
        body = json.loads(event['body']) if 'body' in event and event['body'] else {}
        email = body.get('email')
        password = body.get('password')
        first_name = body.get('first_name')
        last_name = body.get('last_name')
        confirmation_code = body.get('confirmation_code')
        new_password = body.get('new_password')
        attribute_updates = body.get('attribute_updates', {})

        # Routing based on the resource path and HTTP method
        if resource_path == "/signup" and http_method == "POST":
            return sign_up(password, email, first_name, last_name)
        elif resource_path == "/confirm" and http_method == "POST":
            return confirm_user(email)
        elif resource_path == "/login" and http_method == "POST":
            return log_in(email, password)
        elif resource_path == "/forgot-password" and http_method == "POST":
            return forgot_password(email)
        elif resource_path == "/confirm-forgot-password" and http_method == "POST":
            return confirm_forgot_password(email, confirmation_code, new_password)
        elif resource_path == "/get-user" and http_method == "GET":
            return get_user(email)
        elif resource_path == "/update-user" and http_method == "PATCH":
            return update_user(email, attribute_updates)
        elif resource_path == "/delete-user" and http_method == "DELETE":
            return delete_user(email)
        else:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "Resource not found"})
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }


# User Sign-Up
def sign_up(password, email, first_name, last_name):
    client.sign_up(
        ClientId=CLIENT_ID,
        Username=email,
        Password=password,
        UserAttributes=[
            {'Name': 'email', 'Value': email},
            {'Name': 'custom:firstName', 'Value': first_name},
            {'Name': 'custom:lastName', 'Value': last_name}
        ]
    )
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "User signed up successfully"})
    }


# Confirm User
def confirm_user(email):
    client.admin_confirm_sign_up(
        UserPoolId=USER_POOL_ID,
        Username=email
    )
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "User confirmed successfully"})
    }


# User Log-In
def log_in(email, password):
    response = client.initiate_auth(
        ClientId=CLIENT_ID,
        AuthFlow='USER_PASSWORD_AUTH',
        AuthParameters={
            'USERNAME': email,
            'PASSWORD': password
        }
    )
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "User logged in successfully",
            "id_token": response['AuthenticationResult']['IdToken'],
            "access_token": response['AuthenticationResult']['AccessToken'],
            "refresh_token": response['AuthenticationResult']['RefreshToken']
        })
    }


# Forgot Password (Initiate)
def forgot_password(email):
    client.forgot_password(
        ClientId=CLIENT_ID,
        Username=email
    )
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Password reset initiated. Check your email for the code."})
    }


# Confirm Forgot Password
def confirm_forgot_password(email, confirmation_code, new_password):
    client.confirm_forgot_password(
        ClientId=CLIENT_ID,
        Username=email,
        ConfirmationCode=confirmation_code,
        Password=new_password
    )
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Password reset successfully."})
    }


# Get User Data
def get_user(email):
    response = client.admin_get_user(
        UserPoolId=USER_POOL_ID,
        Username=email
    )
    user_attributes = {attr['Name']: attr['Value'] for attr in response['UserAttributes']}
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "User data retrieved successfully", "user_attributes": user_attributes})
    }


# Update User Attributes
def update_user(email, attribute_updates):
    attributes = [{'Name': key, 'Value': value} for key, value in attribute_updates.items()]
    client.admin_update_user_attributes(
        UserPoolId=USER_POOL_ID,
        Username=email,
        UserAttributes=attributes
    )
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "User attributes updated successfully"})
    }


# Delete User
def delete_user(email):
    client.admin_delete_user(
        UserPoolId=USER_POOL_ID,
        Username=email
    )
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "User deleted successfully"})
    }
