FROM node:wheezy

RUN npm install grunt grunt-cli gulp -g
COPY package.json .
COPY bower.json .

RUN npm install

ADD . .

EXPOSE 9000
CMD DEBUG=tkrekry:* grunt serve