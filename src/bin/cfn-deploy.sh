aws cloudformation deploy \
    --template-file ../infrastructure/arch-foundation.yaml \
    --stack-name RCW-Architecture-Foundation-Dev \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --change-set-name ChangeSet1 \
    --parameter-overrides \
        Environment=Dev