FROM node:14-buster

COPY build /var/www/app/build
COPY node_modules /var/www/app/node_modules
COPY package.json /var/www/app/package.json
COPY package-lock.json /var/www/app/package-lock.json

WORKDIR /var/www/app

CMD [ "npm", "start" ]