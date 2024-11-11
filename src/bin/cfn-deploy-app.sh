aws cloudformation deploy \
    --template-file ../infrastructure/arch-app.yaml \
    --stack-name RCW-Architecture-App-Dev \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --no-execute-changeset \
    --region us-west-1 \
    --parameter-overrides \
        Environment=Dev