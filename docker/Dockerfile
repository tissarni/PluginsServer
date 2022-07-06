# syntax=docker/dockerfile:1


FROM node:16-bullseye-slim
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY plugins/package.json ./
RUN npm install --production


COPY . .
RUN chmod -R +x scripts
RUN mv scripts/* /bin
RUN apt-get update
RUN apt-get install -y git
CMD [ "node", "plugins/server.js" ]