import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  provider: any | null;
  signer: any | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: async () => {},
  signMessage: async () => '',
  sendTransaction: async () => '',
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<any | null>(null);

  useEffect(() => {
    loadWalletState();
  }, []);

  const loadWalletState = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('wallet_address');
      const savedConnected = await AsyncStorage.getItem('wallet_connected');
      
      if (savedAddress && savedConnected === 'true') {
        setAddress(savedAddress);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error loading wallet state:', error);
    }
  };

  const connect = async () => {
    try {
      // For now, we'll simulate a wallet connection
      // In a real app, you'd integrate with WalletConnect or other wallet providers
      console.log('Connecting wallet...');
      
      if (Platform.OS === 'web') {
        // Web-specific wallet connection logic would go here
        console.log('Web wallet connection not implemented yet');
      } else {
        // Mobile wallet connection logic would go here
        console.log('Mobile wallet connection not implemented yet');
      }
      
      // Simulate successful connection
      const mockAddress = '0x1234...5678';
      setAddress(mockAddress);
      setIsConnected(true);
      
      await AsyncStorage.setItem('wallet_address', mockAddress);
      await AsyncStorage.setItem('wallet_connected', 'true');
      
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
      
      await AsyncStorage.removeItem('wallet_address');
      await AsyncStorage.removeItem('wallet_connected');
      
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
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
    connect,
    disconnect,
    signMessage,
    sendTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}