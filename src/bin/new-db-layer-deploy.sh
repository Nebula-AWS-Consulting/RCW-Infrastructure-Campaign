aws cloudformation deploy \
    --template-file ../infrastructure/workloads/rcw-client-public-db-layer.yaml \
    --stack-name RCW-Architecture-DB-Dev \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --no-execute-changeset \
    --region us-west-1 \
    --parameter-overrides \
        Environment=Dev