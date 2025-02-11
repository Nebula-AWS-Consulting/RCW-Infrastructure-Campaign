#!/usr/bin/env bash
# A simple script to run all tests in the /tests folder

# Uncomment the following line if you need to ensure we're in the project root:
# cd "$(dirname "$0")/.." || exit 1

echo "=== Running all tests in /tests ==="

# -v : verbose output (shows each test name)
# -s : shows print statements/log output from tests
pytest -v -s ./tests

echo "=== Done! ==="