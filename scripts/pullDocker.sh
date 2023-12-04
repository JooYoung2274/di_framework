# ecr login
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 853456226543.dkr.ecr.ap-northeast-2.amazonaws.com

# pull docker image
docker pull 352200611659.dkr.ecr.ap-northeast-2.amazonaws.com/test-joo:lastest