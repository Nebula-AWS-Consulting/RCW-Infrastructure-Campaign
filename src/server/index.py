import boto3
import json
import logging
import requests
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

client = boto3.client('cognito-idp', region_name='us-west-1')
ses = boto3.client('ses', region_name='us-west-1')
ssm = boto3.client('ssm')

environment = os.getenv('ENVIRONMENT')
domain_name = os.getenv('DOMAIN_NAME')

def get_ssm_parameter(name: str) -> str:
    """Fetch a parameter from AWS SSM Parameter Store with decryption enabled."""
    response = ssm.get_parameter(Name=name, WithDecryption=True)
    return response['Parameter']['Value']

def get_environment() -> str:
    """Retrieve the deployment environment, defaulting to 'dev' if not set."""
    return os.environ.get("ENVIRONMENT", "dev")

def get_user_pool_id() -> str:
    """Retrieve Cognito User Pool ID from SSM."""
    return get_ssm_parameter(f"/rcw-client-backend-{get_environment()}/COGNITO_USER_POOL_ID")

def get_user_pool_client_id() -> str:
    """Retrieve Cognito User Pool Client ID from SSM."""
    return get_ssm_parameter(f"/rcw-client-backend-{get_environment()}/COGNITO_CLIENT_ID")

def get_paypal_client_id() -> str:
    """Retrieve PayPal Client ID from SSM."""
    return get_ssm_parameter(f"/rcw-client-backend-{get_environment()}/PAYPAL_CLIENT_ID")

def get_paypal_secret() -> str:
    """Retrieve PayPal Secret from SSM."""
    return get_ssm_parameter(f"/rcw-client-backend-{get_environment()}/PAYPAL_SECRET")

def get_sender_email() -> str:
    """Retrieve SES Sender Email from SSM."""
    return get_ssm_parameter(f"/rcw-client-backend-{get_environment()}/SESIdentitySenderParameter")

def get_recipient_email() -> str:
    """Retrieve SES Recipient Email from SSM."""
    return get_ssm_parameter(f"/rcw-client-backend-{get_environment()}/SESRecipientParameter")

# ALLOW_ORIGIN = domain_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        http_method = event['httpMethod']
        resource_path = event['path']

        if http_method == "OPTIONS":
            return cors_response(200, {})
        
        if http_method == 'GET' or http_method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            email = query_params.get('email')
        else:
            body = json.loads(event.get('body', "{}"))
            email = body.get('email')
            password = body.get('password')
            first_name = body.get('first_name')
            last_name = body.get('last_name')
            confirmation_code = body.get('confirmation_code')
            access_token = body.get('access_token')
            new_password = body.get('new_password')
            attribute_updates = body.get('attribute_updates', {})
            message = body.get('message')
            custom_id = body.get('custom_id')
            amount = body.get('amount')

        # Routing based on the resource path and HTTP method
        if resource_path == "/signup" and http_method == "POST":
            return sign_up(password, email, first_name, last_name)
        elif resource_path == "/confirm" and http_method == "POST":
            return confirm_user(email)
        elif resource_path == "/confirm-email" and http_method == "POST":
            return confirm_email(access_token, confirmation_code)
        elif resource_path == "/confirm-email-resend" and http_method == "POST":
            return confirm_email_resend(access_token)
        elif resource_path == "/login" and http_method == "POST":
            return log_in(email, password)
        elif resource_path == "/forgot-password" and http_method == "POST":
            return forgot_password(email)
        elif resource_path == "/confirm-forgot-password" and http_method == "POST":
            return confirm_forgot_password(email, confirmation_code, new_password)
        elif resource_path == "/user" and http_method == "GET":
            return get_user(email)
        elif resource_path == "/user" and http_method == "PATCH":
            return update_user(email, attribute_updates)
        elif resource_path == "/user" and http_method == "DELETE":
            return delete_user(email)
        elif resource_path == "/contact-us" and http_method == "POST":
            return contact_us(first_name, email, message)
        elif resource_path == "/create-paypal-order" and http_method == "POST":
            currency = body.get('currency', "USD")
            return create_paypal_order_route(amount, custom_id, currency)
        elif resource_path == "/create-paypal-subscription" and http_method == "POST":
            return create_paypal_subscription_route(amount, custom_id)
        elif http_method == "OPTIONS":
            return cors_response(200, {"message": "CORS preflight successful"})
        else:
            return cors_response(404, {"message": "Resource not found"})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return cors_response(500, {"message": str(e)})

# Helper function to add CORS headers
def cors_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            #"Access-Control-Allow-Credentials": "true"

        },
        "body": json.dumps(body)
    }


# User Sign-Up
def sign_up(password, email, first_name, last_name):
    """
    Sign up a user in the Cognito User Pool.

    Returns a CORS response with an appropriate HTTP status and message.
    
    :param password: The user's password.
    :param email: The user's email address (used as the username).
    :param first_name: The user's first name (stored as custom:firstName).
    :param last_name: The user's last name (stored as custom:lastName).
    :return: A CORS response indicating the result of the sign-up process.
    """
    if not all([email, password, first_name, last_name]):
        return cors_response(400, {"message": "Email, password, first name, and last name are required"})
    
    try:
        # Attempt to sign the user up using the Cognito admin API.
        client.sign_up(
            ClientId=get_user_pool_client_id(), # Retrieve the Cognito User Pool ID.
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'custom:firstName', 'Value': first_name},
                {'Name': 'custom:lastName', 'Value': last_name}
            ]
        )
        return cors_response(200, {"message": "User signed up successfully"})
    
    except Exception as e:
        # Map known exceptions to their corresponding HTTP status and messages.
        # For some exceptions, if the message is None, use the dynamic error message from Cognito.
        error_map = {
            client.exceptions.UsernameExistsException: (409, "User already exists"),
            client.exceptions.AliasExistsException: (409, "A user with this email or phone number already exists."),
            client.exceptions.InvalidPasswordException: (400, None),
            client.exceptions.InvalidParameterException: (400, None),
            client.exceptions.UserLambdaValidationException: (400, None),
            client.exceptions.TooManyRequestsException: (429, "Too many requests. Please try again later."),
            client.exceptions.CodeDeliveryFailureException: (500, "Failed to send confirmation code. Please try again.")
        }
        
        # Iterate over the error map to check if the caught exception is an instance of any known exception.
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                # If a matching exception type is found, return the corresponding CORS response.
                return cors_response(status, {"message": message if message is not None else e.response['Error']['Message']})
        
        # Log any unexpected exceptions to aid in debugging.
        logger.error(f"Error in sign_up: {str(e)}", exc_info=True)
        return cors_response(500, {"message": "An internal server error occurred"})


# Confirm User
def confirm_user(email):
    """
    Confirm a user's sign-up status in the Cognito User Pool.

    This function calls the AWS Cognito admin_confirm_sign_up API to mark a user as confirmed.
    It returns a CORS response with an appropriate HTTP status and message based on the outcome.

    :param email: The email address (username) of the user to be confirmed.
    :return: A CORS response indicating the result of the confirmation.
    """
    try:
        # Attempt to confirm the user's sign-up using the Cognito admin API.
        client.admin_confirm_sign_up(
            UserPoolId=get_user_pool_id(),  # Retrieve the Cognito User Pool ID.
            Username=email                   # Use the email as the username.
        )
        return cors_response(200, {"message": "User confirmed successfully"})

    except Exception as e:
        # Define an error map to associate specific exception types with their respective HTTP status codes and messages.
        error_map = {
            client.exceptions.UserNotFoundException: (
                404, "We could not find a user with this email address."
            ),
            client.exceptions.NotAuthorizedException: (
                403, "You do not have the necessary permissions to confirm this user."
            )
        }

        # Iterate over the error map to check if the caught exception is an instance of any known exception.
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                # If a matching exception type is found, return the corresponding CORS response.
                return cors_response(status, {"message": message})
        
        # Log any unexpected exceptions to aid in debugging.
        logger.error(f"Error in confirm_user: {str(e)}", exc_info=True)
        # Return a generic 500 Internal Server Error response for any unhandled exceptions.
        return cors_response(500, {"message": "Something went wrong while confirming the user. Please try again later."})


# Confirm Email
def confirm_email(access_token, confirmation_code):
    """
    Confirm a user's email by verifying the provided confirmation code using Cognito.

    This function calls Cognito's verify_user_attribute API to verify the user's email attribute.
    It returns a CORS response with an appropriate HTTP status and message based on the outcome.

    :param access_token: The access token for the currently authenticated user.
    :param confirmation_code: The confirmation code sent to the user's email.
    :return: A CORS response indicating success or a specific error message.
    """
    try:
        # Attempt to verify the email attribute using the confirmation code.
        client.verify_user_attribute(
            AccessToken=access_token,
            AttributeName='email',
            Code=confirmation_code
        )
        # If the verification is successful, return a success response.
        return cors_response(200, {"message": "Email confirmed successfully."})
    
    except Exception as e:
        # Mapping of known exception types to their corresponding response status and message.
        error_map = {
            client.exceptions.CodeMismatchException: (
                400, "The confirmation code you entered is incorrect. Please check and try again."
            ),
            client.exceptions.ExpiredCodeException: (
                400, "The confirmation code has expired. Please request a new code and try again."
            ),
            client.exceptions.NotAuthorizedException: (
                403, "You are not authorized to perform this action. Please ensure you are logged in and try again."
            ),
            client.exceptions.UserNotFoundException: (
                404, "We couldn't find a user associated with this request. Please check your details and try again."
            )
        }

        # Check if the caught exception matches any in our error map.
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                return cors_response(status, {"message": message})
        
        # Log unexpected exceptions for debugging.
        logger.error(f"Error in confirm_email: {str(e)}", exc_info=True)
        # Return a generic error response if the exception type is unrecognized.
        return cors_response(500, {
            "message": "An unexpected error occurred while confirming your email. Please try again later."
        })


# Confirm Email Resend
def confirm_email_resend(access_token):
    """
    Resend the email verification code using Cognito.

    This function calls Cognito's get_user_attribute_verification_code API to send a new email verification code.
    It returns a CORS response with an appropriate HTTP status and message.

    :param access_token: The access token of the currently authenticated user.
    :return: A CORS response indicating the result of the verification code request.
    """
    try:
        # Request a new verification code for the email attribute.
        client.get_user_attribute_verification_code(
            AccessToken=access_token,
            AttributeName='email'
        )
        return cors_response(200, {"message": "Verification code sent successfully."})
    
    except Exception as e:
        # Map known exceptions to their HTTP status codes and error messages.
        error_map = {
            client.exceptions.LimitExceededException: (
                429, "You have exceeded the number of allowed attempts. Please wait before trying again."
            ),
            client.exceptions.NotAuthorizedException: (
                403, "You are not authorized to request a new verification code. Please log in and try again."
            ),
            client.exceptions.UserNotFoundException: (
                404, "We could not find a user associated with this request. Please check your details and try again."
            )
        }
        
        # Iterate over the error map and return the corresponding response if a match is found.
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                return cors_response(status, {"message": message})
        
        # Log unexpected exceptions and return a generic error response.
        logger.error(f"Error in confirm_email_resend: {str(e)}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while trying to resend the verification code. Please try again later."
        })


# User Log-In
def log_in(email, password):
    """
    Authenticate a user with Cognito and return tokens and user id on success.
    
    :param email: The user's email address (username).
    :param password: The user's password.
    :return: A CORS response with authentication tokens or an error message.
    """
    if not all([email, password]):
        return cors_response(400, {"message": "Email and password are required"})
    
    try:
        response = client.initiate_auth(
            ClientId=get_user_pool_client_id(),
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )

        id_token = response['AuthenticationResult']['IdToken']
        decoded_token = jwt.decode(id_token, options={"verify_signature": False})
        user_id = decoded_token.get("sub")
        
        return cors_response(200, {
            "message": "User logged in successfully",
            "user_id": user_id,
            "id_token": id_token,
            "access_token": response['AuthenticationResult']['AccessToken'],
            "refresh_token": response['AuthenticationResult']['RefreshToken']
        })
    
    except Exception as e:
        # Define known exceptions with corresponding HTTP status codes and messages.
        error_map = {
            client.exceptions.NotAuthorizedException: (
                401, "The email or password provided is incorrect. Please try again."
            ),
            client.exceptions.UserNotFoundException: (
                404, "We couldn't find a user with this email address. Please check the email entered or sign up if you don't have an account."
            )
        }
        
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                return cors_response(status, {"message": message})
        
        logger.error(f"Error in log_in: {str(e)}", exc_info=True)
        return cors_response(500, {"message": "An unexpected error occurred while attempting to log in. Please try again later."})


# Forgot Password (Initiate)
def forgot_password(email):
    """
    Initiate the forgot password process for a given email using Cognito.

    :param email: The user's email address.
    :return: A CORS response indicating the result of the password reset request.
    """
    try:
        client.forgot_password(
            ClientId=get_user_pool_client_id(),
            Username=email
        )
        return cors_response(200, {"message": "Password reset initiated. Check your email for the code."})
    
    except Exception as e:
        # Map specific exceptions to their corresponding HTTP status codes and messages.
        error_map = {
            client.exceptions.UserNotFoundException: (
                404, "We could not find an account associated with this email address."
            ),
            client.exceptions.LimitExceededException: (
                429, "You have exceeded the number of allowed attempts. Please wait a while before trying again."
            ),
            # For NotAuthorizedException, we'll use the dynamic message from the exception.
            client.exceptions.NotAuthorizedException: (403, None)
        }
        
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                if message is None:
                    message = e.response['Error']['Message']
                return cors_response(status, {"message": message})
        
        logger.error(f"Error in forgot_password: {str(e)}", exc_info=True)
        return cors_response(500, {"message": "An unexpected error occurred while initiating the password reset. Please try again later."})


# Confirm Forgot Password
def confirm_forgot_password(email, confirmation_code, new_password):
    """
    Confirm the password reset by verifying the confirmation code and setting a new password.

    :param email: The user's email address.
    :param confirmation_code: The confirmation code received by the user.
    :param new_password: The new password to be set.
    :return: A CORS response indicating the result of the password reset confirmation.
    """
    try:
        client.confirm_forgot_password(
            ClientId=get_user_pool_client_id(),
            Username=email,
            ConfirmationCode=confirmation_code,
            Password=new_password
        )
        return cors_response(200, {"message": "Password reset successfully."})
    
    except Exception as e:
        # Define a mapping of exceptions to their respective HTTP status codes and messages.
        error_map = {
            client.exceptions.CodeMismatchException: (
                400, "The confirmation code you entered is incorrect. Please check the code and try again."
            ),
            client.exceptions.ExpiredCodeException: (
                400, "The confirmation code has expired. Please request a new code and try again."
            ),
            client.exceptions.InvalidPasswordException: (
                400, None  # Use dynamic error message from Cognito for invalid password.
            ),
            client.exceptions.UserNotFoundException: (
                404, "We could not find an account associated with this email address. Please check your details."
            ),
            client.exceptions.LimitExceededException: (
                429, "You have made too many attempts. Please wait a while before trying again."
            )
        }
        
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                if message is None:
                    # Construct dynamic message for InvalidPasswordException.
                    message = e.response['Error']['Message']
                    message = f"Your new password is invalid: {message}. Please ensure it meets the required criteria."
                return cors_response(status, {"message": message})
        
        logger.error(f"Error in confirm_forgot_password: {str(e)}", exc_info=True)
        return cors_response(500, {"message": "An unexpected error occurred while resetting your password. Please try again later."})


# Get User Data
def get_user(email):
    """
    Retrieve a user's data from Cognito and return their attributes along with the email verification status.

    :param email: The user's email address.
    :return: A CORS response containing user attributes and email verification status or an error message.
    """
    if not email:
        return cors_response(400, {"message": "Missing required 'email' query parameter"})
    
    try:
        response = client.admin_get_user(
            UserPoolId=get_user_pool_id(),
            Username=email
        )
        # Convert the list of attributes to a dictionary.
        user_attributes = {attr['Name']: attr['Value'] for attr in response['UserAttributes']}
        # Determine the email verification status.
        email_verified = user_attributes.get("email_verified", "false").lower() == "true"

        return cors_response(200, {
            "message": "User data retrieved successfully",
            "user_attributes": user_attributes,
            "email_verified": email_verified
        })
    
    except Exception as e:
        # Map specific exceptions to HTTP statuses and messages.
        error_map = {
            client.exceptions.UserNotFoundException: (
                404, "The requested user could not be found. Please check the provided details and try again."
            ),
            client.exceptions.InvalidParameterException: (
                400, "The input parameters are invalid. Please verify the information and try again."
            ),
            client.exceptions.TooManyRequestsException: (
                429, "Too many requests have been made in a short period. Please wait a while before retrying."
            )
        }
        
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                return cors_response(status, {"message": message})
        
        logger.error(f"Unexpected error in get_user: {str(e)}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while retrieving the user. Please try again later."
        })


# Update User Attributes
def update_user(email, attribute_updates):
    """
    Update user attributes in the Cognito User Pool.

    Handles password updates separately using admin_set_user_password, and updates any
    other attributes using admin_update_user_attributes. Returns a CORS response indicating
    the result.

    :param email: The email (username) of the user to update.
    :param attribute_updates: A dictionary of attribute names and their new values.
    :return: A CORS response with an appropriate status and message.
    """
    if not email:
        return cors_response(400, {"message": "Email is required"})
    if not attribute_updates:
        return cors_response(400, {"message": "Attribute updates are required"})
    
    try:
        # Handle password update separately, if provided.
        if 'password' in attribute_updates:
            new_password = attribute_updates.pop('password')
            client.admin_set_user_password(
                UserPoolId=get_user_pool_id(),
                Username=email,
                Password=new_password,
                Permanent=True
            )
        
        # Update any remaining attributes.
        if attribute_updates:
            attributes = [{'Name': key, 'Value': value} for key, value in attribute_updates.items()]
            client.admin_update_user_attributes(
                UserPoolId=get_user_pool_id(),
                Username=email,
                UserAttributes=attributes
            )
        
        return cors_response(200, {"message": "User attributes updated successfully"})
    
    except Exception as e:
        # Map specific exceptions to their HTTP statuses and messages.
        error_map = {
            client.exceptions.UserNotFoundException: (
                404, "No user was found with the provided email address."
            ),
            client.exceptions.InvalidParameterException: (
                400, None  # Use dynamic error message from Cognito.
            ),
            client.exceptions.InvalidPasswordException: (
                400, None  # Use dynamic error message from Cognito.
            ),
            client.exceptions.NotAuthorizedException: (
                403, "You are not authorized to update this user's attributes. Please check your permissions."
            )
        }
        
        for exc_type, (status, static_message) in error_map.items():
            if isinstance(e, exc_type):
                if static_message is None:
                    # For dynamic messages, use a custom prefix based on exception type.
                    if isinstance(e, client.exceptions.InvalidParameterException):
                        message = f"Invalid parameter: {e.response['Error']['Message']}. Please verify your input and try again."
                    elif isinstance(e, client.exceptions.InvalidPasswordException):
                        message = f"Invalid password: {e.response['Error']['Message']}. Please verify your input and try again."
                    else:
                        message = e.response['Error']['Message']
                else:
                    message = static_message
                return cors_response(status, {"message": message})
        
        # Log unexpected exceptions and return a generic error response.
        logger.error(f"Unexpected error in update_user: {str(e)}", exc_info=True)
        return cors_response(500, {"message": "An unexpected error occurred while updating the user attributes. Please try again later."})


# Delete User
def delete_user(email):
    """
    Delete a user from the Cognito User Pool.

    :param email: The email (username) of the user to delete.
    :return: A CORS response indicating the result of the delete operation.
    """
    if not email:
        return cors_response(400, {"message": "Email is required"})
    
    try:
        client.admin_delete_user(
            UserPoolId=get_user_pool_id(),
            Username=email
        )
        return cors_response(200, {"message": "User deleted successfully"})
    
    except Exception as e:
        # Map specific exceptions to HTTP statuses and messages.
        error_map = {
            client.exceptions.UserNotFoundException: (
                404, "No user was found with the provided email address. Please check and try again."
            ),
            client.exceptions.NotAuthorizedException: (
                403, "You are not authorized to delete this user. Please check your permissions."
            )
        }
        
        # Iterate over the error map to return a corresponding response if the exception matches.
        for exc_type, (status, message) in error_map.items():
            if isinstance(e, exc_type):
                return cors_response(status, {"message": message})
        
        # Log unexpected exceptions and return a generic error response.
        logger.error(f"Unexpected error in delete_user: {str(e)}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while attempting to delete the user. Please try again later."
        })


# Contact Us
def contact_us(first_name, email, message):
    """
    Send a contact message via AWS SES.

    :param first_name: Sender's first name.
    :param email: Sender's email address.
    :param message: The content of the message.
    :return: A CORS response with an appropriate status and message.
    """
    if not all([first_name, email, message]):
        return cors_response(400, {"message": "All fields are required: name, email, and message."})
    
    try:
        ses.send_email(
            Source=get_sender_email(),
            Destination={'ToAddresses': [get_recipient_email()]},
            Message={
                'Subject': {'Data': 'Contact Us Form Submission'},
                'Body': {
                    'Text': {'Data': f'Name: {first_name}\nEmail: {email}\nMessage: {message}'}
                }
            }
        )
        return cors_response(200, {"message": "Message sent successfully."})
    
    except Exception as e:
        # Map specific SES exceptions to HTTP statuses and messages.
        error_map = {
            ses.exceptions.MessageRejected: (
                400, "The email message was rejected. Please ensure the provided email address is valid."
            ),
            ses.exceptions.MailFromDomainNotVerifiedException: (
                400, "The sender's email address has not been verified. Please contact support for assistance."
            ),
            ses.exceptions.ConfigurationSetDoesNotExistException: (
                500, "There was a configuration issue with the email service. Please try again later."
            )
        }
        
        for exc_type, (status, msg) in error_map.items():
            if isinstance(e, exc_type):
                logger.error(f"{exc_type.__name__} error in contact_us: {str(e)}", exc_info=True)
                return cors_response(status, {"message": msg})
        
        logger.error(f"Unhandled error in contact_us: {str(e)}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while sending your message. Please try again later."
        })


# Get Paypal Access Token
def get_paypal_access_token():
    url = "https://api-m.sandbox.paypal.com/v1/oauth2/token"
    headers = {
        "Accept": "application/json",
        "Accept-Language": "en_US",
    }
    data = {
        "grant_type": "client_credentials"
    }
    auth = (get_paypal_client_id(), get_paypal_secret())

    try:
        response = requests.post(url, headers=headers, data=data, auth=auth, timeout=10)

        if response.status_code == 200:
            token_data = response.json()
            return token_data["access_token"]
        else:
            error_details = response.json()
            logger.error(f"PayPal token error: {error_details}")
            return cors_response(response.status_code, {
                "message": "Failed to retrieve PayPal access token.",
                "errorType": "PayPalAPIError",
                "details": error_details
            })
    except requests.exceptions.Timeout:
        logger.error("PayPal API request timed out.")
        return cors_response(504, {
            "message": "The request to the PayPal API timed out. Please try again later.",
            "errorType": "TimeoutError"
        })
    except requests.exceptions.ConnectionError:
        logger.error("Connection error while connecting to PayPal API.")
        return cors_response(503, {
            "message": "Unable to connect to the PayPal API. Please check your network and try again.",
            "errorType": "ConnectionError"
        })
    except requests.exceptions.RequestException as e:
        logger.error(f"Unhandled request exception: {e}")
        return cors_response(500, {
            "message": "An unexpected error occurred while connecting to the PayPal API.",
            "errorType": "RequestError"
        })
    except Exception as e:
        logger.error(f"Unexpected error in get_paypal_access_token: {e}")
        return cors_response(500, {
            "message": "An unexpected error occurred while retrieving the PayPal access token.",
            "errorType": "InternalError"
        })

# Create Paypal Order
def create_paypal_order(amount, custom_id, currency="USD"):
    try:
        access_token = get_paypal_access_token()
        if not access_token:
            logger.error("Failed to retrieve PayPal access token.")
            return cors_response(500, {
                "message": "Failed to retrieve PayPal access token.",
                "errorType": "AccessTokenError"
            })

        url = "https://api-m.sandbox.paypal.com/v2/checkout/orders"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": currency,
                        "value": str(amount)
                    },
                    "custom_id": custom_id
                }
            ]
        }

        response = requests.post(url, headers=headers, json=payload, timeout=10)

        if response.status_code == 201:
            return cors_response(201, {
                "order": response.json()
            })
        else:
            error_details = response.json()
            logger.error(f"PayPal order error: {error_details}")
            return cors_response(response.status_code, {
                "message": f"Failed to create PayPal order: {error_details.get('name', 'Unknown error')} - {error_details.get('message', 'No description')}.",
                "errorType": "PayPalAPIError",
                "details": error_details
            })
    except requests.exceptions.Timeout:
        logger.error("PayPal API request timed out.")
        return cors_response(504, {
            "message": "The request to the PayPal API timed out. Please try again later.",
            "errorType": "TimeoutError"
        })
    except requests.exceptions.ConnectionError:
        logger.error("Connection error while connecting to PayPal API.")
        return cors_response(503, {
            "message": "Unable to connect to the PayPal API. Please check your network and try again.",
            "errorType": "ConnectionError"
        })
    except requests.exceptions.RequestException as e:
        logger.error(f"Unhandled request exception: {e}")
        return cors_response(500, {
            "message": "An unexpected error occurred while connecting to the PayPal API.",
            "errorType": "RequestError"
        })
    except Exception as e:
        logger.error(f"Unexpected error in create_paypal_order: {e}")
        return cors_response(500, {
            "message": "An unexpected error occurred while creating the PayPal order. Please try again later.",
            "errorType": "InternalError"
        })

# Create Paypal Order Route
def create_paypal_order_route(amount, custom_id, currency="USD"):
    try:
        if amount <= 0:
            raise ValueError("The amount must be greater than zero.")
        if not isinstance(custom_id, str) or not custom_id.strip():
            raise ValueError("The Custom ID must be a non-empty string.")

        order = create_paypal_order(amount, custom_id, currency)

        if "id" not in order:
            logger.error("PayPal order response missing 'id' field.")
            return cors_response(500, {
                "message": "PayPal order creation succeeded, but the response is incomplete.",
                "errorType": "IncompleteResponse"
            })

        return cors_response(200, {
            "id": order["id"],
            "message": "PayPal order created successfully."
        })

    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return cors_response(400, {
            "message": str(ve),
            "errorType": "ValidationError"
        })

    except requests.exceptions.RequestException as re:
        logger.error(f"Request exception during PayPal order creation: {str(re)}")
        return cors_response(503, {
            "message": "A network error occurred while connecting to PayPal. Please try again later.",
            "errorType": "NetworkError"
        })

    except Exception as e:
        logger.error(f"Unexpected error creating PayPal order: {str(e)}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while processing your request. Please try again later.",
            "errorType": "InternalError"
        })

# Create Paypal Product
def create_paypal_product():
    try:
        access_token = get_paypal_access_token()
        if not access_token:
            logger.error("Failed to retrieve PayPal access token.")
            return cors_response(500, {
                "message": "Failed to retrieve PayPal access token.",
                "errorType": "AccessTokenError"
            })

        url = "https://api-m.sandbox.paypal.com/v1/catalogs/products"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        payload = {
            "name": "Donation Product",
            "description": "A product for donation subscriptions.",
            "type": "SERVICE",
            "category": "CHARITY"
        }

        response = requests.post(url, headers=headers, json=payload, timeout=10)

        if response.status_code == 201:
            product_id = response.json().get("id")
            if not product_id:
                logger.error("PayPal product created, but no product ID returned.")
                return cors_response(500, {
                    "message": "Product creation succeeded, but the response is incomplete.",
                    "errorType": "IncompleteResponse"
                })
            return product_id
        else:
            error_details = response.json()
            logger.error(f"PayPal product creation failed: {error_details}")
            return cors_response(response.status_code, {
                "message": f"Failed to create PayPal product: {error_details.get('name', 'Unknown error')} - {error_details.get('message', 'No description')}.",
                "errorType": "PayPalAPIError",
                "details": error_details
            })
    except requests.exceptions.Timeout:
        logger.error("PayPal API request timed out.")
        return cors_response(504, {
            "message": "The request to the PayPal API timed out. Please try again later.",
            "errorType": "TimeoutError"
        })
    except requests.exceptions.ConnectionError:
        logger.error("Connection error while connecting to PayPal API.")
        return cors_response(503, {
            "message": "Unable to connect to the PayPal API. Please check your network and try again.",
            "errorType": "ConnectionError"
        })
    except requests.exceptions.RequestException as e:
        logger.error(f"Unhandled request exception: {e}")
        return cors_response(500, {
            "message": "An unexpected error occurred while connecting to the PayPal API.",
            "errorType": "RequestError"
        })
    except Exception as e:
        logger.error(f"Unexpected error in create_paypal_product: {e}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while creating the PayPal product. Please try again later.",
            "errorType": "InternalError"
        })

# Create Paypal Plan
def create_paypal_plan(product_id, amount):
    try:
        if not product_id:
            logger.error("Product ID is required to create a PayPal plan.")
            return cors_response(400, {
                "message": "Product ID is required to create a PayPal plan.",
                "errorType": "ValidationError"
            })

        if amount <= 0:
            logger.error("Amount must be greater than zero.")
            return cors_response(400, {
                "message": "Amount must be greater than zero.",
                "errorType": "ValidationError"
            })

        access_token = get_paypal_access_token()
        if not access_token:
            logger.error("Failed to retrieve PayPal access token.")
            return cors_response(500, {
                "message": "Failed to retrieve PayPal access token.",
                "errorType": "AccessTokenError"
            })

        url = "https://api-m.sandbox.paypal.com/v1/billing/plans"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        payload = {
            "product_id": product_id,
            "name": "Weekly Donation Plan",
            "description": "A plan for weekly donations.",
            "status": "ACTIVE",
            "billing_cycles": [
                {
                    "frequency": {
                        "interval_unit": "WEEK",
                        "interval_count": 1
                    },
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "total_cycles": 0,
                    "pricing_scheme": {
                        "fixed_price": {
                            "value": f"{amount:.2f}",
                            "currency_code": "USD"
                        }
                    }
                }
            ],
            "payment_preferences": {
                "auto_bill_outstanding": True,
                "setup_fee": {
                    "value": "0.00",
                    "currency_code": "USD"
                },
                "setup_fee_failure_action": "CONTINUE",
                "payment_failure_threshold": 3
            }
        }

        response = requests.post(url, headers=headers, json=payload, timeout=10)

        if response.status_code == 201:
            plan_id = response.json().get("id")
            if not plan_id:
                logger.error("PayPal plan created, but no plan ID returned.")
                return cors_response(500, {
                    "message": "Plan creation succeeded, but the response is incomplete.",
                    "errorType": "IncompleteResponse"
                })
            return plan_id
        else:
            error_details = response.json()
            logger.error(f"PayPal Plan Creation Failed: {error_details}")
            return cors_response(response.status_code, {
                "message": f"Failed to create PayPal plan: {error_details.get('name', 'Unknown error')} - {error_details.get('message', 'No description')}.",
                "errorType": "PayPalAPIError",
                "details": error_details
            })
    except requests.exceptions.Timeout:
        logger.error("PayPal API request timed out.")
        return cors_response(504, {
            "message": "The request to the PayPal API timed out. Please try again later.",
            "errorType": "TimeoutError"
        })
    except requests.exceptions.ConnectionError:
        logger.error("Connection error while connecting to PayPal API.")
        return cors_response(503, {
            "message": "Unable to connect to the PayPal API. Please check your network and try again.",
            "errorType": "ConnectionError"
        })
    except requests.exceptions.RequestException as e:
        logger.error(f"Unhandled request exception: {e}")
        return cors_response(500, {
            "message": "An unexpected error occurred while connecting to the PayPal API.",
            "errorType": "RequestError"
        })
    except Exception as e:
        logger.error(f"Unexpected error in create_paypal_plan: {e}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while creating the PayPal plan. Please try again later.",
            "errorType": "InternalError"
        })

# Create Paypal Subscription
def create_paypal_subscription(plan_id, custom_id):
    try:
        if not plan_id:
            logger.error("Plan ID is required to create a PayPal subscription.")
            return cors_response(400, {
                "message": "Plan ID is required to create a PayPal subscription.",
                "errorType": "ValidationError"
            })

        if not custom_id:
            logger.error("Custom ID is required to create a PayPal subscription.")
            return cors_response(400, {
                "message": "Custom ID is required to create a PayPal subscription.",
                "errorType": "ValidationError"
            })

        access_token = get_paypal_access_token()
        if not access_token:
            logger.error("Failed to retrieve PayPal access token.")
            return cors_response(500, {
                "message": "Failed to retrieve PayPal access token.",
                "errorType": "AccessTokenError"
            })

        url = "https://api-m.sandbox.paypal.com/v1/billing/subscriptions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        payload = {
            "plan_id": plan_id,
            "custom_id": custom_id
        }

        response = requests.post(url, headers=headers, json=payload, timeout=10)

        if response.status_code == 201:
            subscription = response.json()
            return cors_response(201, {
                "subscription": subscription
            })
        else:
            error_details = response.json()
            logger.error(f"PayPal subscription creation failed: {error_details}")
            return cors_response(response.status_code, {
                "message": f"Failed to create PayPal subscription: {error_details.get('name', 'Unknown error')} - {error_details.get('message', 'No description')}.",
                "errorType": "PayPalAPIError",
                "details": error_details
            })
    except requests.exceptions.Timeout:
        logger.error("PayPal API request timed out.")
        return cors_response(504, {
            "message": "The request to the PayPal API timed out. Please try again later.",
            "errorType": "TimeoutError"
        })
    except requests.exceptions.ConnectionError:
        logger.error("Connection error while connecting to PayPal API.")
        return cors_response(503, {
            "message": "Unable to connect to the PayPal API. Please check your network and try again.",
            "errorType": "ConnectionError"
        })
    except requests.exceptions.RequestException as e:
        logger.error(f"Unhandled request exception: {e}")
        return cors_response(500, {
            "message": "An unexpected error occurred while connecting to the PayPal API.",
            "errorType": "RequestError"
        })
    except Exception as e:
        logger.error(f"Unexpected error in create_paypal_subscription: {e}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while creating the PayPal subscription. Please try again later.",
            "errorType": "InternalError"
        })

# Create Paypal Subscription route
def create_paypal_subscription_route(amount, custom_id):
    try:
        if amount <= 0:
            logger.error("Amount must be greater than zero.")
            return cors_response(400, {
                "message": "Amount must be greater than zero.",
                "errorType": "ValidationError"
            })

        if not custom_id or not custom_id.strip():
            logger.error("Custom ID must be a non-empty string.")
            return cors_response(400, {
                "message": "Custom ID must be a non-empty string.",
                "errorType": "ValidationError"
            })

        product_id = create_paypal_product()
        if not product_id:
            logger.error("Failed to create PayPal product.")
            return cors_response(500, {
                "message": "Failed to create PayPal product.",
                "errorType": "ProductCreationError"
            })

        plan_id = create_paypal_plan(product_id, amount)
        if not plan_id:
            logger.error("Failed to create PayPal plan.")
            return cors_response(500, {
                "message": "Failed to create PayPal plan.",
                "errorType": "PlanCreationError"
            })

        subscription = create_paypal_subscription(plan_id, custom_id)
        subscription_id = subscription.get("id")
        if not subscription_id:
            logger.error("Subscription ID is missing from the PayPal response.")
            return cors_response(500, {
                "message": "Subscription ID is missing from the PayPal response.",
                "errorType": "IncompleteResponse"
            })

        approval_url = next(
            (link["href"] for link in subscription.get("links", []) if link["rel"] == "approve"),
            None
        )
        if not approval_url:
            logger.error("Approval URL is missing from the PayPal response.")
            return cors_response(500, {
                "message": "Approval URL is missing from the PayPal response.",
                "errorType": "IncompleteResponse"
            })

        return cors_response(200, {
            "subscription_id": subscription_id,
            "approval_url": approval_url,
            "message": "PayPal subscription created successfully."
        })

    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return cors_response(400, {
            "message": str(ve),
            "errorType": "ValidationError"
        })
    except Exception as e:
        logger.error(f"Unexpected error creating PayPal subscription: {str(e)}", exc_info=True)
        return cors_response(500, {
            "message": "An unexpected error occurred while processing your request. Please try again later.",
            "errorType": "InternalError"
        })