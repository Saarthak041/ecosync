@echo off
echo 🌿 Ecosync Carbon Credit Trading Platform - Development Setup
echo ============================================================
echo.

REM Check if MongoDB is running
echo 📦 Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  MongoDB is not running. Please start MongoDB first:
    echo    Windows: net start MongoDB
    echo    or run: mongod
    echo.
    echo 💡 For quick testing without MongoDB, you can modify backend/server.js
    echo    to comment out the MongoDB connection.
    echo.
)

echo.
echo 🚀 Starting development servers...
echo.

echo 🔧 Starting Backend Server...
cd backend
start cmd /c "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

echo 📱 Starting React Native App...
start cmd /c "npm run dev"

echo.
echo ✅ Development servers are starting in separate windows...
echo.
echo 📍 Backend API: http://localhost:3000
echo 📍 Frontend: Check terminal for Expo DevTools URL
echo.
echo 📖 For detailed setup instructions, see SETUP_GUIDE.md
echo.
echo Press any key to exit...
pause >nul
