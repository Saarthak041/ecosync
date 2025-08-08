#!/bin/bash
# Quick verification script for blockchain carbon credit features

echo "🔍 EcoSync Blockchain Trading Verification"
echo "=========================================="

echo ""
echo "📁 Checking required files..."

# Check if key files exist
files=(
  "components/BlockchainTrading.tsx"
  "components/WalletConnectProvider.tsx"
  "services/carbonCreditService.ts"
  "utils/mockData.ts"
  "smart-contract/contracts/CarbonCredit.sol"
  "TESTING_GUIDE.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (missing)"
  fi
done

echo ""
echo "🌐 Development Server Status:"
if netstat -ano | grep -q ":19006"; then
  echo "✅ Expo server running on port 19006"
  echo "📱 Access via: http://localhost:19006"
else
  echo "❌ Expo server not running"
  echo "💡 Run: npm run dev"
fi

echo ""
echo "🧪 Testing Instructions:"
echo "1. Open http://localhost:19006 in your browser"
echo "2. Navigate to Trading tab"
echo "3. Click 'Connect Wallet' (test mode)"
echo "4. Verify mock data loads"
echo "5. Test transfer/retire functions"

echo ""
echo "📖 Full guide: TESTING_GUIDE.md"
