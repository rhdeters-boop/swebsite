#!/bin/bash

echo "=== CLEAN FRONTEND LOGS ==="
cat logs/frontend.log | sed 's/\x1b\[[0-9;]*m//g'

echo -e "\n=== CLEAN BACKEND LOGS ==="
cat logs/backend.log | sed 's/\x1b\[[0-9;]*m//g'
