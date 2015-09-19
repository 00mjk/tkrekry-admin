FROM node:wheezy

ENV DEBUG *
RUN npm install grunt-cli gulp -g
RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json
RUN npm install

ADD . /app
 