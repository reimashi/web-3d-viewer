# Build server
FROM maven:3.5-jdk-8
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ONBUILD ADD ./server /usr/src/app
ONBUILD RUN mvn package

# Build client
FROM node:latest as client-builder

RUN apt-get update && \
    apt-get install apt-transport-https rsync -y

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install --no-install-recommends yarn -y

RUN yarn global add webpack webpack-cli less

WORKDIR /app
COPY ./client .

RUN yarn

RUN mkdir -p /dist
RUN webpack-cli --env.BuildDir=/dist --config webpack.config.js

# Deploy runtime
FROM openjdk:8-jre-alpine

WORKDIR /client
COPY --from=client-builder /dist .

WORKDIR /server
COPY --from=server-builder /usr/src/app/target .

ENTRYPOINT ["java", "-jar", "web-3d-viewer-server-0.0.1-SNAPSHOT.jar"]