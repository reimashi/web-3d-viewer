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

RUN yarn

RUN mkdir -p /dist
RUN webpack-cli --env.BuildDir=/dist --config webpack.config.js

# Build server
FROM maven:3.5-jdk-8 as server-builder

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

ADD ./server /usr/src/app

RUN mvn dependency:resolve
RUN mvn package

# Deploy runtime
FROM openjdk:8-jre-alpine

WORKDIR /client
COPY --from=client-builder /dist .

WORKDIR /server
COPY --from=server-builder /usr/src/app/target/server.jar .

ENTRYPOINT ["java", "-jar", "server.jar"]
