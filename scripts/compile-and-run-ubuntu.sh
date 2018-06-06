#!/bin/sh

REPO=https://github.com/reimashi/web-3d-viewer.git

# Install dependencies
sudo apt update
sudo apt install apt-transport-https openjdk-8-jdk git -y

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get update
sudo apt-get install --no-install-recommends yarn nodejs -y

sudo yarn global add webpack webpack-cli

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