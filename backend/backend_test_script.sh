#! /usr/bin/env bash
# startup_test_script.sh
rm -rf ./.nyc_output/*
npx tsc &&


(trap 'kill 0' EXIT; npx nyc --silent npm run _server & npx nyc --silent npm run _simulator & sleep 10; npx playwright test; sleep 60);

# "_test": "node ./backend/out/simulator/simulationHead.js & node ./backend/out/server/server.js & npx playwright test",
# "test": "npx nyc npm run _test",
# "combined": "npx tsc --project ./backend/tsconfig.json && node ./backend/out/simulator/simulationHead.js & node ./backend/out/server/server.js",
# "server": "npx tsc --project ./backend/tsconfig.json && node ./backend/out/server/server.js",
# "simulator": "npx tsc --project ./backend/tsconfig.json && node ./backend/out/simulator/simulationHead.js",
# "frontend": "npm run --prefix ./frontend dev",
# "test2": "sh ./backend_test_script.sh",
# "compile_backend": "npx tsc --project ./backend/tsconfig.json"