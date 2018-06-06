@echo off

REM Check admin
if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)

REM Install chocolatey
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

REM Install dependencies
choco install nodejs yarn git jdk8 maven -y

yarn global add webpack webpack-cli

REM Get the code
git clone https://github.com/reimashi/web-3d-viewer.git repo
cd repo

REM Compile the client
yarn install
webpack-cli --config webpack.config.js
cd ..

REM Compile the server
cd server
mvn dependency:resolve
mvn package

REM Run the server
java -jar ./target/server.jar