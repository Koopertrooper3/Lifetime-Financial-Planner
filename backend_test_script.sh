#! /usr/bin/env bash
# startup_test_script.sh
rm -rf ./.nyc_output/*
npx tsc --project ./backend/tsconfig.json &&


(trap 'kill 0' EXIT; npx nyc --silent npm run server & npx nyc --silent npm run simulator & sleep 10; npx nyc --silent playwright test)
