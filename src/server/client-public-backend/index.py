import json
import boto3
import os
import hashlib
from botocore.exceptions import ClientError

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'AdminTable')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    """Main Lambda handler function."""
    http_method = event.get('httpMethod')
    path = event.get('path')
    response = {
        'statusCode': 400,
        'body': json.dumps({'message': 'Invalid request'})
    }

    if http_method == 'POST' and path == '/users':
        response = add_item(event)
    elif http_method == 'GET' and path.startswith('/users/'):
        response = get_item(event)
    elif http_method == 'PUT' and path.startswith('/users/'):
        response = update_item(event)
    elif http_method == 'DELETE' and path.startswith('/users/'):
        response = delete_item(event)
    else:
        response = {
            'statusCode': 405,
            'body': json.dumps({'message': 'Method not allowed'})
        }

    return response

def add_item(event):
    """Add an item to the DynamoDB table."""
    try:
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('id')
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')

        if not all([user_id, username, email, password]):
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing required fields'})
            }

        # Hash the password before storing it
        password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()

        item = {
            'id': user_id,
            'username': username,
            'email': email,
            'password_hash': password_hash
        }

        table.put_item(Item=item)

        return {
            'statusCode': 201,
            'body': json.dumps({'message': 'User created successfully'})
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f"Error adding item: {e.response['Error']['Message']}"})
        }

def get_item(event):
    """Retrieve an item from the DynamoDB table."""
    try:
        user_id = event['pathParameters']['id']

        response = table.get_item(Key={'id': user_id})
        item = response.get('Item')

        if item:
            # Do not return the password hash
            item.pop('password_hash', None)
            return {
                'statusCode': 200,
                'body': json.dumps(item)
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'User not found'})
            }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f"Error retrieving item: {e.response['Error']['Message']}"})
        }

def update_item(event):
    """Update an item in the DynamoDB table."""
    try:
        user_id = event['pathParameters']['id']
        body = json.loads(event.get('body', '{}'))
        update_expression = []
        expression_attribute_values = {}
        expression_attribute_names = {}

        if 'username' in body:
            update_expression.append('#username = :username')
            expression_attribute_values[':username'] = body['username']
            expression_attribute_names['#username'] = 'username'

        if 'email' in body:
            update_expression.append('#email = :email')
            expression_attribute_values[':email'] = body['email']
            expression_attribute_names['#email'] = 'email'

        if 'password' in body:
            # Hash the new password
            password_hash = hashlib.sha256(body['password'].encode('utf-8')).hexdigest()
            update_expression.append('password_hash = :password_hash')
            expression_attribute_values[':password_hash'] = password_hash

        if not update_expression:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'No valid fields to update'})
            }

        response = table.update_item(
            Key={'id': user_id},
            UpdateExpression='SET ' + ', '.join(update_expression),
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues='UPDATED_NEW'
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User updated successfully', 'attributes': response['Attributes']})
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f"Error updating item: {e.response['Error']['Message']}"})
        }

def delete_item(event):
    """Delete an item from the DynamoDB table."""
    try:
        user_id = event['pathParameters']['id']

        response = table.delete_item(Key={'id': user_id})

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User deleted successfully'})
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f"Error deleting item: {e.response['Error']['Message']}"})
        }
