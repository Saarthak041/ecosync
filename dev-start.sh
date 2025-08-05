#!/bin/bash

echo "🌿 Ecosync Carbon Credit Trading Platform - Development Setup"
echo "============================================================"

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   Windows: net start MongoDB"
    echo "   macOS/Linux: sudo systemctl start mongod"
    echo ""
    echo "💡 For quick testing without MongoDB, you can modify backend/server.js"
    echo "   to comment out the MongoDB connection."
fi

echo ""
echo "🚀 Starting development servers..."
echo ""

# Function to run commands in background
run_backend() {
    echo "🔧 Starting Backend Server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
}

run_frontend() {
    echo "📱 Starting React Native App..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
}

# Trap to kill background processes when script exits
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start servers
run_backend
sleep 3
run_frontend

echo ""
echo "✅ Development servers are starting..."
echo ""
echo "📍 Backend API: http://localhost:3000"
echo "📍 Frontend: Check terminal for Expo DevTools URL"
echo ""
echo "📖 For detailed setup instructions, see SETUP_GUIDE.md"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
