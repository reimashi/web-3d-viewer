#!/bin/sh

REPO=https://github.com/reimashi/web-3d-viewer.git

# As root
sudo su

# Install dependencies
apt update
apt install apt-transport-https openjdk-8-jdk git -y

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install --no-install-recommends yarn -y

yarn global add webpack-cli

# Exit root
exit

# Get the code
git clone "${REPO}" repo
cd repo

# Compile the client
cd ./client

yarn install
webpack-cli --config webpack.config.js

cd ..

# Compile the server
cd server

mvn dependency:resolve
mvn package

# Run the server
java -jar ./target/server.jar