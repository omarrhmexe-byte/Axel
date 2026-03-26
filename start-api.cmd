@echo off
SET PATH=C:\PROGRA~1\nodejs;%PATH%
cd /d C:\root\hiring-autopilot-api

:: Load .env variables into environment
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
  if not "%%A"=="" if not "%%A:~0,1%"=="#" set "%%A=%%B"
)

node node_modules\ts-node-dev\lib\bin.js --respawn --transpile-only src/index.ts
