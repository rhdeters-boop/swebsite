#!/bin/bash

# Frontend and Backend Log Viewer Script

echo "=== Log Viewer Options ==="
echo "1. Frontend logs (real-time)"
echo "2. Backend logs (real-time)" 
echo "3. Frontend errors only"
echo "4. Backend errors only"
echo "5. Latest 20 lines of both logs"
echo "6. Clear logs"

read -p "Choose option (1-6): " choice

case $choice in
    1)
        echo "Following frontend logs (Ctrl+C to exit)..."
        tail -f logs/frontend.log
        ;;
    2)
        echo "Following backend logs (Ctrl+C to exit)..."
        tail -f logs/backend.log
        ;;
    3)
        echo "=== Frontend Errors ==="
        grep -i error logs/frontend.log | tail -10
        ;;
    4)
        echo "=== Backend Errors ==="
        grep -i error logs/backend.log | tail -10
        ;;
    5)
        echo "=== Latest Frontend Logs ==="
        tail -20 logs/frontend.log
        echo ""
        echo "=== Latest Backend Logs ==="
        tail -20 logs/backend.log
        ;;
    6)
        echo "Clearing logs..."
        > logs/frontend.log
        > logs/backend.log
        echo "Logs cleared!"
        ;;
    *)
        echo "Invalid option"
        ;;
esac
