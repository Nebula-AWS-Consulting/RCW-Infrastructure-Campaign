S3_BUCKET=rcw-code-bucket/client-public-backend

pip3 install -r requirements.txt -t dependencies

zip -r dependencies.zip dependencies/
zip -r function.zip index.py

aws s3 cp dependencies.zip s3://$S3_BUCKET/dependencies.zip
aws s3 cp function.zip s3://$S3_BUCKET/function.zip

rm rf dependencies
rm rf dependencies.zip
rm rf function.zip