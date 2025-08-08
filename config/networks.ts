// Ethereum network configurations for production
export const NETWORK_CONFIGS = {
  // Ethereum Testnets (FREE)
  sepolia: {
    chainId: 11155111,
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    contractAddress: process.env.REACT_APP_SEPOLIA_CONTRACT_ADDRESS || '',
  },
  goerli: {
    chainId: 5,
    chainName: 'Goerli Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    contractAddress: process.env.REACT_APP_GOERLI_CONTRACT_ADDRESS || '',
  },
  // Polygon Networks (existing)
  mumbai: {
    chainId: 80001,
    chainName: 'Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC', 
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    contractAddress: process.env.REACT_APP_MUMBAI_CONTRACT_ADDRESS || '',
  },
};

// Default network for your project
export const DEFAULT_NETWORK = 'sepolia'; // or 'goerli'

// Contract ABI (you'll get this after compilation)
export const CARBON_CREDIT_ABI = [
  // Your contract ABI will go here after compilation
];

// App configuration
export const APP_CONFIG = {
  // Toggle between test and live modes
  useTestMode: false, // Set to false for live blockchain
  useMockData: false, // Set to false for real contract data
  defaultNetwork: DEFAULT_NETWORK,
  supportedNetworks: ['sepolia', 'goerli', 'mumbai'],
};

export default NETWORK_CONFIGS;
