#!/bin/bash

# Log viewer script for VOID of DESIRE development
# Usage: ./scripts/logs.sh [frontend|backend|all]

LOG_DIR="./logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# Create logs directory if it doesn't exist
mkdir -p $LOG_DIR

# Function to show usage
show_usage() {
    echo "Usage: $0 [frontend|backend|all]"
    echo ""
    echo "Options:"
    echo "  frontend  - Show frontend (Vite) logs"
    echo "  backend   - Show backend (Express) logs"
    echo "  all       - Show both logs side by side"
    echo "  (no args) - Show both logs side by side (default)"
    echo ""
    echo "Examples:"
    echo "  $0 frontend"
    echo "  $0 backend"
    echo "  $0 all"
}

# Function to tail frontend logs
tail_frontend() {
    echo "📱 Watching Frontend logs..."
    if [ -f "$FRONTEND_LOG" ]; then
        tail -f "$FRONTEND_LOG"
    else
        echo "❌ Frontend log file not found: $FRONTEND_LOG"
        echo "💡 Make sure to run 'npm run dev' first"
    fi
}

# Function to tail backend logs
tail_backend() {
    echo "🔧 Watching Backend logs..."
    if [ -f "$BACKEND_LOG" ]; then
        tail -f "$BACKEND_LOG"
    else
        echo "❌ Backend log file not found: $BACKEND_LOG"
        echo "💡 Make sure to run 'npm run dev' first"
    fi
}

# Function to tail both logs
tail_both() {
    echo "👀 Watching both Frontend and Backend logs..."
    if command -v concurrently >/dev/null 2>&1; then
        concurrently --names "BACKEND,FRONTEND" --prefix-colors "magenta,cyan" \
            "tail -f $BACKEND_LOG 2>/dev/null || echo 'Backend log not found'" \
            "tail -f $FRONTEND_LOG 2>/dev/null || echo 'Frontend log not found'"
    else
        echo "❌ concurrently not found. Installing..."
        npm install -g concurrently
        tail_both
    fi
}

# Main logic
case "$1" in
    "frontend")
        tail_frontend
        ;;
    "backend")
        tail_backend
        ;;
    "all"|"")
        tail_both
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
