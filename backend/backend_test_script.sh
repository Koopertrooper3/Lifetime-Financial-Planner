#! /usr/bin/env bash
# startup_test_script.sh
rm -rf ./.nyc_output/*
npx tsc &&


(trap 'kill 0' EXIT; npx nyc --silent npm run _server & npx nyc --silent npm run _simulator & sleep 10; npx playwright test; sleep 10; exit 0);

node ./simulator/flush.js