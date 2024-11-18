import boto3

client = boto3.client('cognito-idp', region_name='us-west-1')

response = client.sign_up(
    ClientId='2p3glok5k66cvh7hhs8lnpegsc',
    Username='user@example.com',
    Password='YourSecurePassword123!',
    UserAttributes=[
        {'Name': 'email', 'Value': 'user@example.com'}
    ]
)
print(response)

response = client.initiate_auth(
    ClientId='2p3glok5k66cvh7hhs8lnpegsc',
    AuthFlow='USER_PASSWORD_AUTH',
    AuthParameters={
        'USERNAME': 'user@example.com',
        'PASSWORD': 'YourSecurePassword123!'
    }
)
print(response['AuthenticationResult']['IdToken'])

