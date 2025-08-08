# 🧪 Blockchain Carbon Credit Testing Guide

## Quick Setup for Local Testing

### 1. Start the Development Server

Open a terminal in your project folder and run:
```bash
npm run dev
```

This will start the Expo development server. You should see output like:
```
Starting project at C:\Users\Saart\ecosync
Starting Metro Bundler
Metro waiting on exp://192.168.x.x:19000
```

### 2. Access the App

**Option A: Web Browser (Easiest)**
- Open your browser and go to: `http://localhost:19006`
- The app will load in web mode

**Option B: Expo Go App (Mobile Testing)**
- Install "Expo Go" from App Store/Google Play
- Scan the QR code shown in terminal or browser
- The app will load on your mobile device

### 3. Test the Trading Feature

1. **Navigate to Trading Tab**: Tap the "Trading" tab at the bottom
2. **Test Mode is Enabled**: You'll see a "🧪 TEST MODE" indicator
3. **Mock Wallet Connection**: Tap "Connect Wallet" - it will simulate a connection
4. **View Mock Data**: You'll see sample carbon credits and transactions

## 🔍 What to Test

### Test Mode Features (Default)
- ✅ **Wallet Connection**: Mock wallet connects instantly
- ✅ **Portfolio Display**: Shows 3 sample carbon credits
- ✅ **Transaction History**: Displays mock transactions
- ✅ **Transfer Simulation**: Test transfer interface (no real blockchain)
- ✅ **Retirement Simulation**: Test credit retirement interface

### Live Mode Features (Advanced)
Toggle to live mode to test with real blockchain:
- 🔗 **Real Wallet Connection**: Connects to MetaMask/WalletConnect
- 🔗 **Polygon Network**: Uses Mumbai testnet
- 🔗 **Smart Contract**: Interacts with deployed contract

## 📱 Testing Steps

### 1. Basic Navigation Test
```
1. Open app → Trading tab
2. Verify: "Connect Your Wallet" screen appears
3. Verify: Test mode toggle is visible
4. Tap "Connect Wallet"
5. Verify: Portfolio screen loads with mock data
```

### 2. Portfolio Test
```
1. After connecting wallet
2. Verify: Shows 3 carbon credits
3. Verify: Portfolio stats display correctly
4. Verify: Recent transactions show
5. Pull down to refresh
```

### 3. Transfer Test
```
1. Find a carbon credit with "Transfer" button
2. Tap "Transfer"
3. Enter recipient address: 0x1234567890123456789012345678901234567890
4. Enter quantity: 5
5. Tap "Transfer"
6. Verify: Success message appears
```

### 4. Retirement Test
```
1. Find a carbon credit with "Retire" button
2. Tap "Retire"
3. Enter quantity: 10
4. Enter reason: "Corporate sustainability offset"
5. Tap "Retire"
6. Verify: Success message appears
```

### 5. Mode Switching Test
```
1. Tap the "🧪 TEST MODE" indicator
2. Verify: Alert shows mode switch
3. Test both test and live modes
4. Verify: UI updates accordingly
```

## 🛠️ Troubleshooting

### Development Server Issues
```bash
# If metro bundler fails to start:
npx expo start --clear

# If you see dependency errors:
npm install

# If TypeScript errors persist:
npx expo install --fix
```

### Common Issues

**1. "Module not found" errors**
- Run: `npm install`
- Restart the dev server

**2. JSX compilation errors**
- Check tsconfig.json has `"jsx": "react-native"`
- Restart TypeScript server in VS Code

**3. Wallet connection fails**
- In test mode: This is expected, it uses mock data
- In live mode: Ensure MetaMask is installed

**4. App won't load in browser**
- Try: `http://localhost:19006` instead of the IP address
- Clear browser cache
- Try incognito/private mode

## 📊 Expected Test Results

### Test Mode (Default)
- **Mock Credits**: 3 carbon credits displayed
- **Mock Transactions**: 5 sample transactions
- **Mock Wallet**: Address shows as "0x742d...EdAb"
- **Network**: Shows "Mumbai" testnet
- **Balance**: Shows mock MATIC balance

### User Interface
- **Clean Design**: Modern gradient header
- **Responsive**: Works on mobile and web
- **Interactive**: Buttons and modals work smoothly
- **Feedback**: Success/error messages appear

### Performance
- **Fast Loading**: Under 3 seconds to load
- **Smooth Scrolling**: No lag when scrolling
- **Quick Responses**: Button taps respond immediately

## 🎯 Success Criteria

✅ **App Loads Successfully**: No crashes or errors
✅ **Trading Tab Works**: Can navigate to trading screen
✅ **Wallet Connects**: Mock connection succeeds
✅ **Data Displays**: Credits and transactions show
✅ **Actions Work**: Transfer and retire modals function
✅ **UI Responsive**: Works on different screen sizes

## 🔄 Next Steps After Testing

### If Tests Pass
1. **Deploy Smart Contract**: Deploy to Mumbai testnet
2. **Configure Live Mode**: Update contract addresses
3. **Test Real Transactions**: Use testnet tokens
4. **Add More Features**: Marketplace, staking, etc.

### If Tests Fail
1. **Check Console**: Look for error messages
2. **Verify Dependencies**: Ensure all packages installed
3. **Check File Paths**: Verify import statements
4. **Restart Server**: Clear cache and restart

## 📞 Getting Help

If you encounter issues:
1. Check the terminal output for error messages
2. Look in browser developer console (F12)
3. Verify all files are saved
4. Try restarting the development server
5. Check that all required dependencies are installed

## 🚀 Advanced Testing

### Real Blockchain Testing (Optional)
1. Install MetaMask browser extension
2. Add Mumbai testnet network
3. Get test MATIC from faucet
4. Switch to live mode in app
5. Test real blockchain transactions

### Mobile Device Testing
1. Install Expo Go app
2. Scan QR code from terminal
3. Test on actual mobile device
4. Verify touch interactions work
5. Test offline/online behavior

---

**Ready to test?** Start with: `npm run dev` and open `http://localhost:19006`
