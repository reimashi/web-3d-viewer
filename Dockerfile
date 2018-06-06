# Build client
FROM node:latest as client-builder

RUN apt-get update && \
    apt-get install apt-transport-https -y

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install --no-install-recommends yarn -y

RUN yarn global add webpack webpack-cli

WORKDIR /app
COPY ./client .

RUN yarn install
RUN webpack-cli --config webpack.config.js

# Build server
FROM maven:3.5-jdk-8 as server-builder

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ADD ./server /usr/src/app

RUN mvn dependency:resolve
RUN mvn package

# Deploy runtime
FROM openjdk:10-jre-slim

LABEL web="https://github.com/reimashi/web-3d-viewer"
LABEL maintainer="Aitor González Fernández <info@aitorgf.com>"

ENV WEB_PORT=4080
ENV WEB_USER=admin
ENV WEB_PASS=admin
ENV WEB_AUTH_ENABLE=false
ENV STATIC_PATH=/client
ENV DATABASE_PATH=/database

EXPOSE ${WEB_PORT}/tcp

RUN mkdir -p ${DATABASE_PATH}
VOLUME ${DATABASE_PATH}

WORKDIR ${STATIC_PATH}
COPY --from=client-builder /app/dist .
RUN mkdir -p ${STATIC_PATH}/models
VOLUME ${STATIC_PATH}/models

WORKDIR /server
COPY --from=server-builder /usr/src/app/target/server.jar .

ENTRYPOINT ["java", "-jar", "server.jar"]
HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost:${WEB_PORT} || exit 1