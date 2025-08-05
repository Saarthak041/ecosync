import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contract ABI (simplified for key functions)
const CARBON_CREDIT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function retireCarbonCredit(uint256 tokenId, uint256 quantity, string reason)",
  "function getCreditMetadata(uint256 tokenId) view returns (tuple(string projectId, string vintage, string serialNumber, string registry, string metadataURI, address issuer, uint256 issuanceDate, bool isRetired))",
  "function getRetirementHistory(uint256 tokenId) view returns (tuple(uint256 tokenId, uint256 quantity, address retiree, string reason, uint256 timestamp)[])",
  "event CreditRetired(uint256 indexed tokenId, address indexed retiree, uint256 quantity, string reason)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)"
];

const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '0x...'; // Your deployed contract address
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface CarbonCredit {
  id: string;
  name: string;
  projectId: string;
  vintage: string;
  quantity: number;
  serialNumber: string;
  registry: string;
  status: 'active' | 'retired';
  imageUrl: string;
  currentBalance?: number;
  metadata?: {
    description: string;
    location: string;
    sdgs: string[];
    methodology: string;
    verifier: string;
  };
}

export interface CarbonTransaction {
  id: string;
  type: 'purchase' | 'transfer' | 'retirement';
  creditId: string;
  quantity: number;
  date: Date;
  txHash?: string;
  counterparty?: string;
  reason?: string;
}

class CarbonCreditService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CARBON_CREDIT_ABI, signer);
  }

  async getUserCredits(address: string): Promise<CarbonCredit[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/portfolio/${address}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch credits');
      }

      return data.portfolio.map((credit: any) => ({
        id: credit.tokenId.toString(),
        name: credit.name,
        projectId: credit.projectId,
        vintage: credit.vintage,
        quantity: credit.quantity,
        serialNumber: credit.serialNumber,
        registry: credit.registry,
        status: credit.status,
        imageUrl: credit.imageUrl || 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg',
        currentBalance: credit.currentBalance,
        metadata: credit.metadata
      }));
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }
  }

  async getUserTransactions(address: string): Promise<CarbonTransaction[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions?address=${address}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      return data.transactions.map((tx: any) => ({
        id: tx._id,
        type: tx.type === 'issuance' ? 'purchase' : tx.type,
        creditId: tx.tokenId.toString(),
        quantity: tx.quantity,
        date: new Date(tx.blockTimestamp),
        txHash: tx.txHash,
        counterparty: tx.type === 'transfer' ? tx.to : tx.from,
        reason: tx.reason
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async transferCredit(
    tokenId: string,
    toAddress: string,
    quantity: number
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const signer = this.contract.runner as ethers.JsonRpcSigner;
      const fromAddress = await signer.getAddress();

      const tx = await this.contract.safeTransferFrom(
        fromAddress,
        toAddress,
        tokenId,
        quantity,
        '0x'
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error transferring credit:', error);
      throw error;
    }
  }

  async retireCredit(
    tokenId: string,
    quantity: number,
    reason: string
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.retireCarbonCredit(tokenId, quantity, reason);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error retiring credit:', error);
      throw error;
    }
  }

  async getCreditBalance(address: string, tokenId: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const balance = await this.contract.balanceOf(address, tokenId);
      return Number(balance);
    } catch (error) {
      console.error('Error getting credit balance:', error);
      throw error;
    }
  }

  async getCreditMetadata(tokenId: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const metadata = await this.contract.getCreditMetadata(tokenId);
      return {
        projectId: metadata.projectId,
        vintage: metadata.vintage,
        serialNumber: metadata.serialNumber,
        registry: metadata.registry,
        metadataURI: metadata.metadataURI,
        issuer: metadata.issuer,
        issuanceDate: new Date(Number(metadata.issuanceDate) * 1000),
        isRetired: metadata.isRetired
      };
    } catch (error) {
      console.error('Error getting credit metadata:', error);
      throw error;
    }
  }

  async getRetirementHistory(tokenId: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const retirements = await this.contract.getRetirementHistory(tokenId);
      return retirements.map((retirement: any) => ({
        tokenId: Number(retirement.tokenId),
        quantity: Number(retirement.quantity),
        retiree: retirement.retiree,
        reason: retirement.reason,
        timestamp: new Date(Number(retirement.timestamp) * 1000)
      }));
    } catch (error) {
      console.error('Error getting retirement history:', error);
      throw error;
    }
  }

  // Cache management
  async cacheUserData(address: string, credits: CarbonCredit[], transactions: CarbonTransaction[]) {
    try {
      await AsyncStorage.setItem(`credits_${address}`, JSON.stringify(credits));
      await AsyncStorage.setItem(`transactions_${address}`, JSON.stringify(transactions));
      await AsyncStorage.setItem(`cache_timestamp_${address}`, Date.now().toString());
    } catch (error) {
      console.error('Error caching user data:', error);
    }
  }

  async getCachedUserData(address: string): Promise<{ credits: CarbonCredit[], transactions: CarbonTransaction[] } | null> {
    try {
      const cacheTimestamp = await AsyncStorage.getItem(`cache_timestamp_${address}`);
      if (!cacheTimestamp) return null;

      // Check if cache is less than 5 minutes old
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      if (cacheAge > 5 * 60 * 1000) return null;

      const creditsData = await AsyncStorage.getItem(`credits_${address}`);
      const transactionsData = await AsyncStorage.getItem(`transactions_${address}`);

      if (!creditsData || !transactionsData) return null;

      return {
        credits: JSON.parse(creditsData),
        transactions: JSON.parse(transactionsData).map((tx: any) => ({
          ...tx,
          date: new Date(tx.date)
        }))
      };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }
}

export default new CarbonCreditService();