@echo off

rem Batch script to start the electron app
set NODE_ENV=production
set AUTH_PASSWORD=admin
set HTTP_PORT=3000

npx electron.cmd --no-sandbox .\index.js
