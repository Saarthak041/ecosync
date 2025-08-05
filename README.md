# Ecosync Carbon Credit Trading Platform

A comprehensive blockchain-based carbon credit trading platform built with React Native (Expo), Solidity smart contracts, and a Node.js backend.

## 🌿 Features

- **ERC-1155 Carbon Credits**: Tokenized carbon credits on Polygon blockchain
- **Wallet Integration**: WalletConnect v2 support for secure wallet connections
- **Real-time Trading**: Peer-to-peer and institutional carbon credit transfers
- **Credit Retirement**: Transparent carbon credit retirement with on-chain proof
- **IPFS Metadata**: Decentralized storage for carbon credit certificates and metadata
- **The Graph Integration**: Efficient blockchain data indexing and querying
- **Mobile-First**: Beautiful React Native app with production-ready UI

## 🏗️ Architecture

### Smart Contract (Polygon PoS)
- **ERC-1155** standard for carbon credits
- **Role-based access control** (Issuer, Verifier, Admin)
- **Retirement tracking** with reasons and timestamps
- **Metadata management** with IPFS integration

### Backend Services
- **Node.js/Express** API server
- **MongoDB** for off-chain data storage
- **IPFS** integration for metadata storage
- **The Graph** subgraph for blockchain data indexing
- **ethers.js** for blockchain interactions

### React Native App
- **Expo SDK 52** with Expo Router
- **WalletConnect v2** for wallet integration
- **Real-time updates** from blockchain events
- **Offline support** with AsyncStorage caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- IPFS node or Pinata account
- Polygon wallet with MATIC tokens

### 1. Smart Contract Deployment

```bash
cd smart-contract
npm install
cp .env.example .env
# Edit .env with your configuration

# Deploy to Mumbai testnet
npm run deploy:mumbai

# Deploy to Polygon mainnet
npm run deploy:polygon
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### 3. Subgraph Deployment

```bash
cd subgraph
npm install

# Update subgraph.yaml with your contract address
# Deploy to The Graph
npm run deploy
```

### 4. React Native App

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📱 App Features

### Carbon Credit Management
- View portfolio of owned carbon credits
- Real-time balance updates from blockchain
- Detailed credit information (project, vintage, registry)

### Trading & Transfers
- Transfer credits to other wallet addresses
- Batch transfer support
- Transaction history with blockchain verification

### Credit Retirement
- Retire credits with custom reasons
- Permanent on-chain retirement records
- Retirement certificate generation

### Wallet Integration
- WalletConnect v2 support
- MetaMask integration
- Automatic network switching to Polygon

## 🔧 Configuration

### Environment Variables

#### Smart Contract
```env
PRIVATE_KEY=your_private_key
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_api_key
```

#### Backend
```env
MONGODB_URI=mongodb://localhost:27017/ecosync
CONTRACT_ADDRESS=your_deployed_contract_address
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
JWT_SECRET=your_jwt_secret
```

#### React Native
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_CONTRACT_ADDRESS=your_contract_address
EXPO_PUBLIC_SUBGRAPH_URL=your_subgraph_url
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd smart-contract
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

## 📊 The Graph Queries

### Get User's Carbon Credits
```graphql
query GetUserCredits($owner: Bytes!) {
  tokenBalances(where: { owner: $owner, balance_gt: 0 }) {
    token {
      tokenId
      projectId
      vintage
      registry
      totalSupply
    }
    balance
  }
}
```

### Get Retirement History
```graphql
query GetRetirements($tokenId: BigInt!) {
  retirementEvents(where: { token: $tokenId }) {
    retiree
    quantity
    reason
    blockTimestamp
    transactionHash
  }
}
```

## 🔐 Security Features

- **Role-based access control** for credit issuance
- **Transfer validation** to prevent retired credit transfers
- **Metadata verification** by authorized verifiers
- **Secure wallet connections** with WalletConnect
- **Input validation** and sanitization
- **Rate limiting** on API endpoints

## 🌍 Carbon Registry Integration

The platform is designed for future integration with major carbon registries:

- **Verra (VCS)**: Verified Carbon Standard credits
- **Gold Standard**: High-quality carbon credits
- **Climate Action Reserve**: North American carbon credits
- **Toucan Protocol**: Bridge to existing carbon markets
- **KlimaDAO**: DeFi carbon market integration

## 📈 Monitoring & Analytics

- **Real-time transaction monitoring**
- **Portfolio value tracking**
- **Retirement impact metrics**
- **Market activity analytics**
- **Environmental impact reporting**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@ecosync.app

## 🗺️ Roadmap

- [ ] Mobile app store deployment
- [ ] Cross-chain bridge integration
- [ ] Advanced trading features (limit orders, auctions)
- [ ] Carbon footprint calculator integration
- [ ] Corporate dashboard for bulk operations
- [ ] API for third-party integrations
- [ ] Multi-language support
- [ ] Advanced analytics and reporting

---

Built with ❤️ for a sustainable future 🌱