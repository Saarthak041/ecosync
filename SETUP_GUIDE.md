# Ecosync Carbon Credit Trading Platform - Setup Guide

## 🚀 Quick Start Guide

This project consists of 4 main components that work together:
1. **Smart Contract** (Hardhat/Solidity) - Blockchain layer
2. **Backend** (Node.js/Express) - API server
3. **Subgraph** (The Graph) - Blockchain data indexing
4. **React Native App** (Expo) - Mobile frontend

## Prerequisites ✅

Make sure you have the following installed:
- **Node.js 18+**
- **MongoDB** (for backend database)
- **Git** (for version control)
- **Expo CLI** (for React Native development)

Optional but recommended:
- **IPFS node** or Pinata account (for metadata storage)
- **Polygon wallet** with MATIC tokens (for blockchain interaction)

## 🔧 Environment Setup

### 1. Backend Environment Configuration
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with your configuration:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecosync-carbon-credits

# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address

# IPFS Configuration (Optional - for production features)
IPFS_API_URL=https://api.pinata.cloud
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

### 2. Smart Contract Environment Configuration
```bash
cd smart-contract
cp .env.example .env
```
Edit `smart-contract/.env` with your configuration:
```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com

# For contract verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# IPFS Gateway
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 3. React Native App Environment
Create `.env` in the root directory:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_CONTRACT_ADDRESS=your_contract_address
EXPO_PUBLIC_SUBGRAPH_URL=your_subgraph_url
```

## 🏃‍♂️ Running the Project

### Option 1: Development Mode (Recommended for testing)

#### Step 1: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

#### Step 2: Run Backend Server
```bash
cd backend
npm run dev
```
Backend will be available at: http://localhost:3000

#### Step 3: Run React Native App
```bash
# From project root directory
npm run dev
```
This will start the Expo development server. You can:
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone
- Press `a` for Android emulator
- Press `i` for iOS simulator

### Option 2: Full Blockchain Setup (Advanced)

If you want to deploy smart contracts and use full blockchain features:

#### Step 1: Deploy Smart Contract
```bash
cd smart-contract

# Compile contracts
npm run compile

# Deploy to Mumbai testnet (requires MATIC tokens)
npm run deploy:mumbai

# Deploy to Polygon mainnet (requires MATIC tokens)
npm run deploy:polygon
```

#### Step 2: Deploy Subgraph
```bash
cd subgraph

# Update subgraph.yaml with your contract address
# Then deploy to The Graph
npm run deploy
```

#### Step 3: Update Environment Variables
Update the CONTRACT_ADDRESS in your backend and frontend .env files with the deployed contract address.

#### Step 4: Start All Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

## 📱 App Features

Once running, the app includes:

### **Carbon Credit Management**
- View portfolio of owned carbon credits
- Real-time balance updates from blockchain
- Detailed credit information (project, vintage, registry)

### **Trading & Transfers**
- Transfer credits to other wallet addresses
- Batch transfer support
- Transaction history with blockchain verification

### **Credit Retirement**
- Retire credits with custom reasons
- Permanent on-chain retirement records
- Retirement certificate generation

### **Wallet Integration**
- WalletConnect v2 support
- MetaMask integration
- Automatic network switching to Polygon

## 🧪 Testing

### Test Smart Contracts
```bash
cd smart-contract
npm test
```

### Test Backend
```bash
cd backend
npm test
```

## 🔍 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check the MONGODB_URI in backend/.env

2. **Expo Start Issues**
   - Clear Expo cache: `npx expo start --clear`
   - Update Expo CLI: `npm install -g @expo/cli`

3. **Smart Contract Deployment Issues**
   - Make sure you have MATIC tokens in your wallet
   - Check your PRIVATE_KEY and RPC URLs

4. **WalletConnect Issues**
   - Make sure you're using a compatible wallet
   - Check network settings (should be Polygon/Mumbai)

### Getting Help

- Check the project's README.md for more detailed information
- Review the console logs for specific error messages
- Ensure all environment variables are properly configured

## 🚀 Next Steps

1. **For Development**: Start with Option 1 to test the app locally
2. **For Production**: Set up your own MongoDB, IPFS, and deploy smart contracts
3. **For Customization**: Explore the codebase and modify components as needed

Happy coding! 🌿
