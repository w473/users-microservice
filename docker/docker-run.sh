#/bin/bash
docker run -d -p $1:80 -w=/var/www/app --mount type=bind,source="$(pwd)/..",target=/var/www/app \
node:14-buster npm run start-dev