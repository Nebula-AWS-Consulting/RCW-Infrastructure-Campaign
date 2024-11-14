import json
import os
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute
from pynamodb.exceptions import DoesNotExist
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Define the User model
class User(Model):
    class Meta:
        table_name = os.environ.get('DYNAMODB_TABLE')
        region = os.environ.get('AWS_REGION')

    user_id = UnicodeAttribute(hash_key=True)
    name = UnicodeAttribute()
    email = UnicodeAttribute()

def lambda_handler(event, context):
    http_method = event.get('httpMethod', '')
    resource = event.get('resource', '')

    if http_method == 'GET' and resource == '/users':
        return get_users(event)
    elif http_method == 'POST' and resource == '/users':
        return create_user(event)
    elif http_method == 'GET' and resource == '/users/{userId}':
        return get_user(event)
    elif http_method == 'PUT' and resource == '/users/{userId}':
        return update_user(event)
    elif http_method == 'DELETE' and resource == '/users/{userId}':
        return delete_user(event)
    else:
        return {
            'statusCode': 400,
            'body': json.dumps('Unsupported method or path')
        }

def create_user(event):
    try:
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('userId')
        name = body.get('name')
        email = body.get('email')

        user = User(user_id)
        user.name = name
        user.email = email
        user.save()

        logger.info('User created: %s', user_id)
        return {
            'statusCode': 201,
            'body': json.dumps({'message': 'User created', 'user': user.attribute_values})
        }
    except Exception as e:
        logger.error('Error creating user: %s', e)
        return {
            'statusCode': 400,
            'body': json.dumps(str(e))
        }

def get_user(event):
    try:
        user_id = event['pathParameters']['userId']
        user = User.get(user_id)

        return {
            'statusCode': 200,
            'body': json.dumps(user.attribute_values)
        }
    except DoesNotExist:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'User not found'})
        }
    except Exception as e:
        logger.error('Error getting user: %s', e)
        return {
            'statusCode': 400,
            'body': json.dumps(str(e))
        }

def update_user(event):
    try:
        user_id = event['pathParameters']['userId']
        body = json.loads(event.get('body', '{}'))
        name = body.get('name')
        email = body.get('email')

        user = User.get(user_id)
        if name:
            user.name = name
        if email:
            user.email = email
        user.save()

        logger.info('User updated: %s', user_id)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User updated', 'user': user.attribute_values})
        }
    except DoesNotExist:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'User not found'})
        }
    except Exception as e:
        logger.error('Error updating user: %s', e)
        return {
            'statusCode': 400,
            'body': json.dumps(str(e))
        }

def delete_user(event):
    try:
        user_id = event['pathParameters']['userId']
        user = User.get(user_id)
        user.delete()

        logger.info('User deleted: %s', user_id)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User deleted'})
        }
    except DoesNotExist:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'User not found'})
        }
    except Exception as e:
        logger.error('Error deleting user: %s', e)
        return {
            'statusCode': 400,
            'body': json.dumps(str(e))
        }

def get_users(event):
    try:
        limit = int(event.get('queryStringParameters', {}).get('limit', 10))
        last_evaluated_key = event.get('queryStringParameters', {}).get('last_evaluated_key')

        scan_kwargs = {'limit': limit}
        if last_evaluated_key:
            scan_kwargs['exclusive_start_key'] = {'user_id': last_evaluated_key}

        users = []
        scan = User.scan(**scan_kwargs)
        for user in scan:
            users.append(user.attribute_values)

        response = {
            'users': users,
            'last_evaluated_key': scan.last_evaluated_key
        }

        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
    except Exception as e:
        logger.error('Error getting users: %s', e)
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
