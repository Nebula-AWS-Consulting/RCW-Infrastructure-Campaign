aws cloudformation deploy \
    --template-file ../infrastructure/arch-app.yaml \
    --stack-name RCW-Architecture-App-Dev \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --change-set-name ChangeSet1 \
    --parameter-overrides \
        Environment=Dev