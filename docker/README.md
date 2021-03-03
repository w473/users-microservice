## source machine:

https://hub.docker.com/_/node

## run:command:

docker-run.sh LOCAL_PORT_NUMBER

## build - run commands from main dir

docker build -t users-ms:0.0.1 -f ./docker/Dockerfile .
docker tag users-ms:0.0.1 users-ms:latest
