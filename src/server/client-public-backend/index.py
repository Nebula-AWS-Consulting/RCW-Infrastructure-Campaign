import boto3
from botocore.exceptions import ClientError

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-west-1')  # Replace with your region

# Reference your table
table_name = "AdminTable"
table = dynamodb.Table(table_name)

def add_item():
    """Add an item to the DynamoDB table."""
    try:
        response = table.put_item(
            Item={
                'id': 'user123',  # Partition key
                'username': 'john_doe',
                'email': 'john@example.com',
                'password': 'securepassword'
            }
        )
        print("Item added:", response)
    except ClientError as e:
        print(f"Error adding item: {e.response['Error']['Message']}")

def get_item():
    """Retrieve an item from the DynamoDB table."""
    try:
        response = table.get_item(
            Key={
                'id': 'user123'  # Specify the primary key
            }
        )
        item = response.get('Item')
        if item:
            print("Item retrieved:", item)
        else:
            print("Item not found")
    except ClientError as e:
        print(f"Error retrieving item: {e.response['Error']['Message']}")

def update_item():
    """Update an item in the DynamoDB table."""
    try:
        response = table.update_item(
            Key={
                'id': 'user123'  # Specify the primary key
            },
            UpdateExpression="SET email = :email, username = :username",
            ExpressionAttributeValues={
                ':email': 'new_email@example.com',
                ':username': 'john_updated'
            },
            ReturnValues="UPDATED_NEW"
        )
        print("Item updated:", response['Attributes'])
    except ClientError as e:
        print(f"Error updating item: {e.response['Error']['Message']}")

def delete_item():
    """Delete an item from the DynamoDB table."""
    try:
        response = table.delete_item(
            Key={
                'id': 'user123'  # Specify the primary key
            }
        )
        print("Item deleted:", response)
    except ClientError as e:
        print(f"Error deleting item: {e.response['Error']['Message']}")

# Example usage
if __name__ == "__main__":
    add_item()
    get_item()
    update_item()
    get_item()
    delete_item()
    get_item()
