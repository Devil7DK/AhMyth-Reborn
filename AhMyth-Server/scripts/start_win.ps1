# PowerShell script to start the electron app

$env:NODE_ENV = "production"
$env:AUTH_PASSWORD = "admin"
$env:HTTP_PORT = 3000

Start-Process "npx" -ArgumentList "electron", "--no-sandbox", ".\index.js" -Wait
