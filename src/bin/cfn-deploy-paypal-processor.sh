#!/bin/bash

TEMPLATE_FILE_PAYPAL_PROCESSOR="../infrastructure/workloads/rcw-paypal-processor.yaml"
BUILD_DIR=".aws-sam/build"

# Validate the SAM template
echo "Validating the SAM template..."
sam validate --template-file "$TEMPLATE_FILE_PAYPAL_PROCESSOR"

if [ $? -ne 0 ]; then
    echo "SAM template validation failed. Exiting..."
    exit 1
fi

# Run SAM build
echo "Building the SAM application..."
sam build --template-file "$TEMPLATE_FILE_PAYPAL_PROCESSOR" --build-dir "$BUILD_DIR"

if [ $? -ne 0 ]; then
    echo "SAM build failed. Exiting..."
    exit 1
fi

# Deploy the stack using the built template
echo "Deploying the SAM application..."
sam deploy \
    --template-file "$BUILD_DIR/template.yaml" \
    --stack-name RCW-Architecture-Paypal-Processor-Dev \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --no-execute-changeset \
    --region us-west-1 \
    --parameter-overrides Environment=Dev

if [ $? -ne 0 ]; then
    echo "SAM deploy failed. Exiting..."
    exit 1
fi

echo "Paypal processing application deployed successfully!"