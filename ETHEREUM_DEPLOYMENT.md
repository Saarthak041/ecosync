# Ethereum Testnet Deployment Guide

## 📋 Prerequisites

### 1. Get Free Testnet ETH
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Goerli Faucet**: https://goerlifaucet.com/
- Request 0.1-1 ETH (free, takes 1-2 minutes)

### 2. Get Infura API Key (Free)
1. Go to https://infura.io/
2. Sign up for free account
3. Create new project
4. Copy Project ID (your API key)

### 3. Setup Environment Variables
Create `.env` file in your project root:

```bash
# Ethereum Testnet Configuration
INFURA_PROJECT_ID=your_infura_project_id_here
PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Network Selection (choose one)
DEPLOY_NETWORK=sepolia  # or 'goerli'
```

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
cd smart-contract
npm install @openzeppelin/contracts
npm install @nomiclabs/hardhat-etherscan
```

### Step 2: Update Hardhat Config
```javascript
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY], 
      chainId: 5,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### Step 3: Deploy Contract
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Or deploy to Goerli testnet  
npx hardhat run scripts/deploy.js --network goerli
```

### Step 4: Verify Contract (Optional)
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 💰 Cost Estimation
- **Contract Deployment**: ~0.01-0.05 ETH (FREE on testnet)
- **Token Minting**: ~0.001-0.005 ETH per transaction (FREE on testnet)
- **Trading Operations**: ~0.001-0.003 ETH per trade (FREE on testnet)

## 🔧 Update Frontend Configuration

After deployment, update your app with the deployed contract address:

```typescript
// In your app configuration
const CONTRACT_CONFIG = {
  sepolia: {
    chainId: 11155111,
    contractAddress: "0xYourDeployedContractAddress",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
  },
  goerli: {
    chainId: 5, 
    contractAddress: "0xYourDeployedContractAddress",
    rpcUrl: "https://goerli.infura.io/v3/YOUR_INFURA_KEY"
  }
};
```

## 📱 Frontend Integration

### Update Network in WalletConnectProvider
```typescript
// Use Sepolia testnet
const DEFAULT_CHAIN_ID = 11155111;
const DEFAULT_RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";
```

### Test Mode vs Live Mode
```typescript
// Toggle between test and live blockchain
const [useTestnet, setUseTestnet] = useState(true);
const [useMockData, setUseMockData] = useState(false);
```

## ✅ Benefits of Ethereum Testnet

1. **100% Free**: No real money needed
2. **Real Blockchain**: Actual Ethereum experience
3. **Public Verification**: Contracts visible on Etherscan
4. **MetaMask Compatible**: Users can interact easily
5. **IPFS Integration**: Store metadata off-chain
6. **Production Ready**: Easy migration to mainnet later

## 🎯 Next Steps

1. Deploy contract to Sepolia testnet
2. Update frontend configuration
3. Test all trading functionality
4. Add IPFS metadata storage
5. Implement real carbon credit validation
6. Create admin dashboard for credit issuance
7. Add regulatory compliance features

## 💡 Migration to Mainnet

When ready for production:
1. Change network to Ethereum mainnet
2. Budget ~$50-200 for deployment
3. Get security audit
4. Implement proper tokenomics
5. Add governance features
