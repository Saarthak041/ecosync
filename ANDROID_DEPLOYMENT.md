# 📱 Android Production Deployment Guide

## Building for Google Play Store

### 1. Create Production Build
```bash
# Build Android APK
npx expo build:android

# Or build AAB (recommended for Play Store)
npx expo build:android --type app-bundle
```

### 2. Configure App Permissions
Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "INTERNET",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### 3. Blockchain-Specific Configuration
```bash
# Install production dependencies
npm install --production

# Configure for mainnet (production)
# Update smart contract addresses in services/carbonCreditService.ts
```

### 4. Wallet Integration for Android
- **MetaMask Mobile**: Automatic deep linking
- **Trust Wallet**: WalletConnect integration  
- **Coinbase Wallet**: Native support
- **Rainbow Wallet**: Full compatibility

### 5. Testing Checklist
- [ ] QR code scanning works
- [ ] Wallet connection via deep links
- [ ] Transaction signing on mobile
- [ ] Offline data persistence
- [ ] Push notifications (optional)

### 6. Play Store Requirements
- Target SDK 34+ (Android 14)
- 64-bit native libraries
- App signing by Google Play
- Privacy policy for crypto features

## Real Wallet Testing on Android

### Test with MetaMask Mobile
1. Install MetaMask mobile app
2. Import test wallet or create new
3. Switch to Mumbai testnet
4. Get test MATIC from faucet
5. Test transactions in your app

### WalletConnect Flow
1. Tap "Connect Wallet" in app
2. Select WalletConnect option
3. Scan QR code with wallet app
4. Approve connection
5. Test transfers/retirements
