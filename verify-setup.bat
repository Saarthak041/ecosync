@echo off
REM Quick verification script for blockchain carbon credit features

echo 🔍 EcoSync Blockchain Trading Verification
echo ==========================================

echo.
echo 📁 Checking required files...

REM Check if key files exist
if exist "components\BlockchainTrading.tsx" (echo ✅ components\BlockchainTrading.tsx) else (echo ❌ components\BlockchainTrading.tsx ^(missing^))
if exist "components\WalletConnectProvider.tsx" (echo ✅ components\WalletConnectProvider.tsx) else (echo ❌ components\WalletConnectProvider.tsx ^(missing^))
if exist "services\carbonCreditService.ts" (echo ✅ services\carbonCreditService.ts) else (echo ❌ services\carbonCreditService.ts ^(missing^))
if exist "utils\mockData.ts" (echo ✅ utils\mockData.ts) else (echo ❌ utils\mockData.ts ^(missing^))
if exist "smart-contract\contracts\CarbonCredit.sol" (echo ✅ smart-contract\contracts\CarbonCredit.sol) else (echo ❌ smart-contract\contracts\CarbonCredit.sol ^(missing^))
if exist "TESTING_GUIDE.md" (echo ✅ TESTING_GUIDE.md) else (echo ❌ TESTING_GUIDE.md ^(missing^))

echo.
echo 🌐 Development Server Status:
netstat -ano | findstr :19006 >nul 2>&1
if %errorlevel%==0 (
  echo ✅ Expo server running on port 19006
  echo 📱 Access via: http://localhost:19006
) else (
  echo ❌ Expo server not running
  echo 💡 Run: npm run dev
)

echo.
echo 🧪 Testing Instructions:
echo 1. Open http://localhost:19006 in your browser
echo 2. Navigate to Trading tab
echo 3. Click 'Connect Wallet' ^(test mode^)
echo 4. Verify mock data loads
echo 5. Test transfer/retire functions

echo.
echo 📖 Full guide: TESTING_GUIDE.md

pause
