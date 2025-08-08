import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';
import { ethers } from 'ethers';

// Ethereum network configurations
const SEPOLIA_CONFIG = {
  chainId: 11155111,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

const GOERLI_CONFIG = {
  chainId: 5,
  chainName: 'Goerli Testnet', 
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://goerli.infura.io/v3/YOUR_INFURA_KEY'],
  blockExplorerUrls: ['https://goerli.etherscan.io/'],
};

// Polygon network configuration (keeping existing)
const POLYGON_CONFIG = {
  chainId: 137,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

const MUMBAI_CONFIG = {
  chainId: 80001,
  chainName: 'Mumbai Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
  blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
};

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  provider: ethers.JsonRpcProvider | ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;
  switchNetwork: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  balance: null,
  connect: async () => {},
  disconnect: async () => {},
  signMessage: async () => '',
  sendTransaction: async () => '',
  switchNetwork: async () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    loadWalletState();
    initializeProvider();
  }, []);

  const initializeProvider = async () => {
    try {
      // Initialize with Sepolia testnet for development
      const sepoliaRpcUrl = process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 
        `https://sepolia.infura.io/v3/${process.env.EXPO_PUBLIC_INFURA_PROJECT_ID}` ||
        'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
      
      const rpcProvider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
      setProvider(rpcProvider);
      setChainId(11155111); // Sepolia testnet
      
      console.log('🌐 Initialized Sepolia testnet provider');
    } catch (error) {
      console.error('Error initializing provider:', error);
      // Fallback to Polygon if Sepolia fails
      const rpcProvider = new ethers.JsonRpcProvider('https://polygon-rpc.com/');
      setProvider(rpcProvider);
      setChainId(137);
    }
  };

  const loadWalletState = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('wallet_address');
      const savedConnected = await AsyncStorage.getItem('wallet_connected');
      
      if (savedAddress && savedConnected === 'true') {
        setAddress(savedAddress);
        setIsConnected(true);
        await updateBalance(savedAddress);
      }
    } catch (error) {
      console.error('Error loading wallet state:', error);
    }
  };

  const updateBalance = async (address: string) => {
    try {
      if (provider) {
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const connect = async () => {
    try {
      console.log('Connecting wallet...');
      
      if (Platform.OS === 'web') {
        // Web-specific wallet connection (MetaMask)
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          if (accounts.length > 0) {
            const signer = await browserProvider.getSigner();
            const address = await signer.getAddress();
            
            setProvider(browserProvider);
            setSigner(signer);
            setAddress(address);
            setIsConnected(true);
            
            await AsyncStorage.setItem('wallet_address', address);
            await AsyncStorage.setItem('wallet_connected', 'true');
            await updateBalance(address);
          }
        } else {
          throw new Error('MetaMask not found');
        }
      } else {
        // Mobile wallet connection using deep linking
        const walletConnectUri = `wc:example-uri@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=example-key`;
        
        // For now, simulate connection - in production, use proper WalletConnect
        const mockAddress = '0x742d35CC7C6B22C03e60CA5124DFC5A0A0f45F91';
        setAddress(mockAddress);
        setIsConnected(true);
        
        await AsyncStorage.setItem('wallet_address', mockAddress);
        await AsyncStorage.setItem('wallet_connected', 'true');
        await updateBalance(mockAddress);
      }
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      setIsConnected(false);
      setAddress(null);
      setProvider(null);
      setSigner(null);
      setBalance(null);
      
      await AsyncStorage.removeItem('wallet_address');
      await AsyncStorage.removeItem('wallet_connected');
      
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
        setChainId(targetChainId);
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      // Mock signature for development
      console.log('Signing message:', message);
      return 'mock_signature_' + Date.now();
      
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  const sendTransaction = async (transaction: any): Promise<string> => {
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      // Mock transaction for development
      console.log('Sending transaction:', transaction);
      return 'mock_transaction_hash_' + Date.now();
      
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    provider,
    signer,
    chainId,
    balance,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}