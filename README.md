# web-3d-viewer
Web to store 3D models and preview it

## Generate client

1. Get the dependencies
```bash
yarn install
```

2. Get the webpack CLI
```bash
yarn global add webpack-cli
```

3. Generate the client (By default, in `./dist`)
```bash
webpack-cli --config webpack.config.js
```

## Generate server

1. Get the dependencies 
```bash
mvn dependency:resolve
```

2. Generate the JAR binary
```bash
mvn package
```

3. Run the JAR. By default, it search the client files in `../client/dist`

## Deploy all with docker

```bash
docker run -p 80:4080/tcp reimashi/web-3d-viewer
```

## Configure

The server can be configurated through environment variables:

 - **WEB_PORT:** Http port *(Default: `4080`)*
 - **WEB_AUTH_ENABLE:** Enable or disable the authentication *(Default: `false`)*
 - **WEB_USER:** User for authentication *(Default: `admin`)*
 - **WEB_PASS:** User password for authentication *(Default: `admin`)*
 - **STATIC_PATH:** Path for the static files inside the container *(Default: `/client`)*
 - **DATABASE_PATH:** Path for the database file inside the container *(Default: `/database`)*