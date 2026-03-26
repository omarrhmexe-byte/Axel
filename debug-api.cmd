SET PATH=C:\PROGRA~1\nodejs;%PATH%
cd /d C:\root\hiring-autopilot-api
echo Node version:
node --version
echo ts-node-dev version:
node_modules\.bin\ts-node-dev.cmd --version
echo Starting server...
node_modules\.bin\ts-node-dev.cmd --respawn --transpile-only src/index.ts
