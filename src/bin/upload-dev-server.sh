#!/bin/bash

# Define file paths and S3 bucket locations
ZIP_FILE_SERVER="function.zip"
ZIP_FILE_LAYER="dependencies.zip"
BUCKET_NAME="rcw-code-bucket"
SERVER_S3_PATH="client-public-backend/function-dev.zip"
LAYER_S3_PATH="client-public-backend/dependencies-dev.zip"

# Install dependencies into the python folder
echo "Installing dependencies..."
if [ -f "requirements.txt" ]; then
    mkdir -p python
    pip install -r requirements.txt --target=python/lib/python3.12/site-packages/
else
    echo "requirements.txt not found. Skipping dependency installation."
fi


# Create zip files
echo "Creating zip files..."
zip -r9 "$ZIP_FILE_SERVER" index.py
zip -r9 "$ZIP_FILE_LAYER" python

# Function to check if an object exists in S3
function check_and_upload {
    local file=$1
    local s3_path=$2

    echo "Checking if $s3_path exists in S3..."
    if aws s3api head-object --bucket "$BUCKET_NAME" --key "$s3_path" 2>/dev/null; then
        echo "$s3_path exists. Updating the object..."
    else
        echo "$s3_path does not exist. Uploading new object..."
    fi

    # Upload the file
    aws s3 cp "$file" "s3://$BUCKET_NAME/$s3_path"
}

# Check and upload files
check_and_upload "$ZIP_FILE_SERVER" "$SERVER_S3_PATH"
check_and_upload "$ZIP_FILE_LAYER" "$LAYER_S3_PATH"

# Cleanup zip files
echo "Cleaning up local zip files..."
rm -f "$ZIP_FILE_SERVER" "$ZIP_FILE_LAYER"

echo "Script completed successfully."
