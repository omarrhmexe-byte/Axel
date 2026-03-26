#!/bin/sh
cd /c/root/hiring-autopilot-api
/c/Program\ Files/nodejs/node.exe node_modules/.bin/ts-node-dev --respawn --transpile-only src/index.ts
