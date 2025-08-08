# EcoSync Blockchain Integration Setup Guide

This guide will help you deploy and integrate the blockchain-based carbon credit system into your EcoSync app.

## Prerequisites

1. Node.js (v16+)
2. MetaMask or compatible Web3 wallet
3. MATIC tokens for Polygon deployment (or ETH for Ethereum)
4. Basic understanding of blockchain concepts

## Step 1: Smart Contract Deployment

### 1.1 Environment Setup

Create a `.env` file in the `smart-contract` directory:

```bash
# Network RPCs
POLYGON_RPC_URL=https://polygon-rpc.com/
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Private key for deployment (use a dedicated deployment wallet)
PRIVATE_KEY=your_private_key_here

# Etherscan API for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Metadata base URI
METADATA_BASE_URI=https://api.ecosync.com/metadata/

# Additional role holders (comma-separated addresses)
ADDITIONAL_ISSUERS=0x1234567890123456789012345678901234567890
ADDITIONAL_VERIFIERS=0x1234567890123456789012345678901234567890
```

### 1.2 Install Dependencies

```bash
cd smart-contract
npm install
```

### 1.3 Compile Contract

```bash
npm run compile
```

### 1.4 Deploy to Testnet (Mumbai)

```bash
npm run deploy:mumbai
```

### 1.5 Deploy to Mainnet (Polygon)

```bash
npm run deploy:polygon
```

### 1.6 Verify Contract (Optional)

```bash
npx hardhat verify --network polygon CONTRACT_ADDRESS "https://api.ecosync.com/metadata/"
```

## Step 2: Backend Setup

### 2.1 Environment Configuration

Add to your backend `.env` file:

```bash
# MongoDB for indexing blockchain data
MONGODB_URI=mongodb://localhost:27017/ecosync-carbon-credits

# Blockchain RPCs
POLYGON_RPC_URL=https://polygon-rpc.com/
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/

# Contract addresses (from deployment)
CONTRACT_ADDRESS_POLYGON=0x...
CONTRACT_ADDRESS_MUMBAI=0x...

# IPFS for metadata storage
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET=your_pinata_secret

# Private keys for backend operations (optional)
ISSUER_PRIVATE_KEY=your_issuer_private_key
```

### 2.2 Install Dependencies

```bash
cd backend
npm install ethers mongoose dotenv
```

### 2.3 Start Backend with Blockchain Services

```bash
npm start
```

## Step 3: React Native App Configuration

### 3.1 Environment Configuration

Create/update `.env` in your root directory:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Blockchain RPCs
EXPO_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com/
EXPO_PUBLIC_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com/

# Contract addresses
EXPO_PUBLIC_CONTRACT_ADDRESS_POLYGON=0x...
EXPO_PUBLIC_CONTRACT_ADDRESS_MUMBAI=0x...
```

### 3.2 Update App Layout

Add the WalletProvider to your app layout:

```tsx
// app/_layout.tsx
import { WalletProvider } from '../components/WalletConnectProvider';

export default function RootLayout() {
  return (
    <WalletProvider>
      {/* Your existing layout */}
    </WalletProvider>
  );
}
```

## Step 4: Testing the Integration

### 4.1 Test Smart Contract Functions

```bash
cd smart-contract
npm test
```

### 4.2 Test Wallet Connection

1. Open your React Native app
2. Navigate to the Trading tab
3. Connect your wallet (MetaMask on web, mobile wallet on mobile)
4. Verify the connection shows your address

### 4.3 Test Credit Operations

1. **Issue Credits** (if you have issuer role):
   ```javascript
   // Using the backend API or directly via contract
   await carbonCredit.issueCarbonCredit(
     "0x...", // recipient
     100,     // quantity
     "PROJ-001", // project ID
     "2024",  // vintage
     "SN001", // serial number
     "Verra", // registry
     "QmXXX..." // IPFS metadata URI
   );
   ```

2. **Transfer Credits**:
   - Select a credit in the app
   - Choose "Transfer"
   - Enter recipient address and quantity
   - Confirm transaction in wallet

3. **Retire Credits**:
   - Select a credit in the app
   - Choose "Retire"
   - Enter quantity and reason
   - Confirm transaction in wallet

## Step 5: Production Deployment

### 5.1 Security Considerations

1. **Private Key Management**:
   - Use hardware wallets for mainnet deployments
   - Never commit private keys to version control
   - Use environment variables or key management services

2. **Role Management**:
   - Limit issuer roles to verified organizations
   - Implement multi-sig for critical operations
   - Regular audit of role holders

3. **Smart Contract Security**:
   - Get security audits before mainnet deployment
   - Use timelock controllers for upgrades
   - Implement emergency pause mechanisms

### 5.2 Scalability Considerations

1. **Event Indexing**:
   - Use The Graph Protocol for efficient querying
   - Implement proper database indexing for off-chain data
   - Consider using Redis for caching

2. **Gas Optimization**:
   - Batch operations when possible
   - Use EIP-2771 for meta-transactions
   - Implement gas-efficient patterns

3. **Network Selection**:
   - Polygon for cost-effective operations
   - Ethereum for maximum security
   - Consider Layer 2 solutions

## Step 6: Integration with Carbon Registries

### 6.1 Verra Registry Integration

```javascript
// Example integration with Verra VCS registry
const verraAPI = {
  async verifyCredit(serialNumber) {
    // Implement API call to Verra registry
    const response = await fetch(`https://registry.verra.org/api/credits/${serialNumber}`);
    return response.json();
  },
  
  async retireCredit(serialNumber, quantity, reason) {
    // Implement retirement in Verra registry
    // This should be called after on-chain retirement
  }
};
```

### 6.2 Toucan Protocol Bridge

```javascript
// Example integration with Toucan Protocol
const toucanBridge = {
  async bridgeCredits(registryCredits) {
    // Bridge registry credits to on-chain tokens
    // Implement Toucan Protocol integration
  }
};
```

## Monitoring and Maintenance

### 6.1 Event Monitoring

Monitor these key events:
- `CreditIssued`: New credits created
- `CreditRetired`: Credits permanently retired
- `TransferSingle`: Credit transfers between addresses

### 6.2 Regular Tasks

1. **Database Maintenance**:
   - Regular backups of transaction data
   - Clean up old cached data
   - Monitor database performance

2. **Contract Monitoring**:
   - Monitor gas usage trends
   - Track contract balance and operations
   - Watch for unusual activity patterns

3. **Registry Synchronization**:
   - Regular sync with external registries
   - Verify on-chain data matches registry records
   - Handle discrepancies promptly

## Troubleshooting

### Common Issues

1. **Transaction Failures**:
   - Check gas limits and prices
   - Verify network connectivity
   - Ensure sufficient balance

2. **Wallet Connection Issues**:
   - Clear app cache and reconnect
   - Check network settings in wallet
   - Verify contract addresses

3. **Data Synchronization**:
   - Check backend event listeners
   - Verify database connections
   - Monitor API endpoints

### Support Resources

- [Ethereum Documentation](https://ethereum.org/developers/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs/)

## Next Steps

1. **Enhanced Features**:
   - Implement carbon credit marketplace
   - Add price discovery mechanisms
   - Integrate with DeFi protocols

2. **Mobile Optimization**:
   - Optimize for mobile wallet integrations
   - Implement QR code scanning
   - Add biometric authentication

3. **Analytics and Reporting**:
   - Build comprehensive dashboards
   - Implement carbon footprint tracking
   - Generate compliance reports

This completes the basic blockchain integration for your EcoSync carbon credit trading system!
