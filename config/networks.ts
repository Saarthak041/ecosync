// Amoy Polygon network configuration
export const NETWORK_CONFIGS = {
  amoy: {
    chainId: 80002,
    chainName: 'Amoy Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
    contractAddress: process.env.REACT_APP_AMOY_CONTRACT_ADDRESS || '',
  },
};

// Default network for your project
export const DEFAULT_NETWORK = 'amoy';

// Contract ABI (you'll get this after compilation)
export const CARBON_CREDIT_ABI = [
  // Your contract ABI will go here after compilation
];

// App configuration
export const APP_CONFIG = {
  useTestMode: false, // Set to false for live blockchain
  useMockData: false, // Set to false for real contract data
  defaultNetwork: DEFAULT_NETWORK,
  supportedNetworks: ['amoy'],
};

export default NETWORK_CONFIGS;
