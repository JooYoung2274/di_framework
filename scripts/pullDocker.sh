# ecr login
aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com

# pull docker image
docker pull 352200611659.dkr.ecr.ap-northeast-2.amazonaws.com/test:lastest