## source machine:

https://hub.docker.com/_/node

## run:command:

docker-run.sh LOCAL_PORT_NUMBER

## build - run commands from main dir

docker build -t users-ms:0.0.3 -f ./docker/Dockerfile .
docker tag users-ms:0.0.3 users-ms:latest

docker tag users-ms:0.0.3 docker.pkg.github.com/w473/users-microservice/users-ms:0.0.3
docker push docker.pkg.github.com/w473/users-microservice/users-ms:0.0.3
