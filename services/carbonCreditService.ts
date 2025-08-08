import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete Contract ABI for ERC-1155 Carbon Credits
const CARBON_CREDIT_ABI = [
  // ERC-1155 Standard functions
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  
  // Carbon Credit specific functions
  "function issueCarbonCredit(address to, uint256 quantity, string projectId, string vintage, string serialNumber, string registry, string metadataURI) returns (uint256)",
  "function retireCarbonCredit(uint256 tokenId, uint256 quantity, string reason)",
  "function getCreditMetadata(uint256 tokenId) view returns (tuple(string projectId, string vintage, string serialNumber, string registry, string metadataURI, address issuer, uint256 issuanceDate, bool isRetired))",
  "function getRetirementHistory(uint256 tokenId) view returns (tuple(uint256 tokenId, uint256 quantity, address retiree, string reason, uint256 timestamp)[])",
  "function totalSupply(uint256 id) view returns (uint256)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  
  // Events
  "event CreditIssued(uint256 indexed tokenId, address indexed issuer, address indexed recipient, uint256 quantity, string projectId, string vintage)",
  "event CreditRetired(uint256 indexed tokenId, address indexed retiree, uint256 quantity, string reason)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI)"
];

// Contract addresses - update these when you deploy
const CONTRACT_ADDRESSES = {
  polygon: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS_POLYGON || '0x0000000000000000000000000000000000000000',
  mumbai: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS_MUMBAI || '0x0000000000000000000000000000000000000000',
  ethereum: process.env.EXPO_PUBLIC_CONTRACT_ADDRESS_ETHEREUM || '0x0000000000000000000000000000000000000000',
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface CarbonCredit {
  id: string;
  tokenId: number;
  name: string;
  projectId: string;
  vintage: string;
  quantity: number;
  currentBalance?: number;
  serialNumber: string;
  registry: string;
  status: 'active' | 'retired';
  imageUrl: string;
  issuer: string;
  issuanceDate: Date;
  metadataURI?: string;
  metadata?: {
    description: string;
    location: string;
    sdgs: string[];
    methodology: string;
    verifier: string;
    projectType: string;
    additionalDocuments?: string[];
  };
}

export interface CarbonTransaction {
  id: string;
  type: 'purchase' | 'transfer' | 'retirement' | 'issuance';
  creditId: string;
  tokenId?: number;
  quantity: number;
  date: Date;
  txHash?: string;
  from?: string;
  to?: string;
  counterparty?: string;
  reason?: string;
  gasUsed?: string;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface MarketListing {
  id: string;
  tokenId: number;
  seller: string;
  quantity: number;
  pricePerCredit: string; // in ETH/MATIC
  totalPrice: string;
  currency: 'ETH' | 'MATIC';
  status: 'active' | 'sold' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date;
  credit: CarbonCredit;
}

export interface RetirementCertificate {
  tokenId: number;
  quantity: number;
  retiree: string;
  reason: string;
  timestamp: Date;
  txHash: string;
  certificateId: string;
}

class CarbonCreditService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.JsonRpcProvider | ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private chainId: number = 137; // Default to Polygon

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      // Initialize default provider (Polygon)
      this.provider = new ethers.JsonRpcProvider('https://polygon-rpc.com/');
      this.chainId = 137;
    } catch (error) {
      console.error('Error initializing provider:', error);
    }
  }

  public async initializeContract(provider: ethers.JsonRpcProvider | ethers.BrowserProvider, signer?: ethers.JsonRpcSigner, chainId: number = 137) {
    this.provider = provider;
    this.signer = signer || null;
    this.chainId = chainId;
    
    const contractAddress = this.getContractAddress(chainId);
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('Contract not deployed on this network');
      return;
    }
    
    this.contract = new ethers.Contract(
      contractAddress, 
      CARBON_CREDIT_ABI, 
      signer || provider
    );
  }

  private getContractAddress(chainId: number): string {
    switch (chainId) {
      case 137: return CONTRACT_ADDRESSES.polygon;
      case 80001: return CONTRACT_ADDRESSES.mumbai;
      case 1: return CONTRACT_ADDRESSES.ethereum;
      default: return CONTRACT_ADDRESSES.polygon;
    }
  }

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    // Deprecated method - use initializeContract instead
    await this.initializeContract(provider, signer);
  }

  // Blockchain methods
  async getUserCredits(address: string): Promise<CarbonCredit[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Get all user's token balances from blockchain
      const credits: CarbonCredit[] = [];
      
      // We'll need to track token IDs, typically done via events or backend indexing
      // For now, let's try to get from backend API first, then verify on-chain
      const response = await fetch(`${API_BASE_URL}/credits/portfolio/${address}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Verify each credit's balance on-chain
        for (const credit of data.portfolio) {
          const balance = await this.contract.balanceOf(address, credit.tokenId);
          if (balance > 0) {
            const metadata = await this.contract.getCreditMetadata(credit.tokenId);
            
            credits.push({
              id: credit.tokenId.toString(),
              tokenId: credit.tokenId,
              name: `${metadata.projectId} - ${metadata.vintage}`,
              projectId: metadata.projectId,
              vintage: metadata.vintage,
              quantity: Number(balance),
              currentBalance: Number(balance),
              serialNumber: metadata.serialNumber,
              registry: metadata.registry,
              status: metadata.isRetired ? 'retired' : 'active',
              imageUrl: credit.imageUrl || 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg',
              issuer: metadata.issuer,
              issuanceDate: new Date(Number(metadata.issuanceDate) * 1000),
              metadataURI: metadata.metadataURI,
              metadata: credit.metadata
            });
          }
        }
      }
      
      return credits;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw error;
    }
  }

  async transferCredits(to: string, tokenId: number, quantity: number): Promise<string> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or no signer available');
      }

      const tx = await this.contract.safeTransferFrom(
        await this.signer.getAddress(),
        to,
        tokenId,
        quantity,
        '0x'
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error transferring credits:', error);
      throw error;
    }
  }

  async retireCredits(tokenId: number, quantity: number, reason: string): Promise<string> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or no signer available');
      }

      const tx = await this.contract.retireCarbonCredit(tokenId, quantity, reason);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error retiring credits:', error);
      throw error;
    }
  }

  async getCreditDetails(tokenId: number): Promise<CarbonCredit | null> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const metadata = await this.contract.getCreditMetadata(tokenId);
      const totalSupply = await this.contract.totalSupply(tokenId);
      
      return {
        id: tokenId.toString(),
        tokenId,
        name: `${metadata.projectId} - ${metadata.vintage}`,
        projectId: metadata.projectId,
        vintage: metadata.vintage,
        quantity: Number(totalSupply),
        serialNumber: metadata.serialNumber,
        registry: metadata.registry,
        status: metadata.isRetired ? 'retired' : 'active',
        imageUrl: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg',
        issuer: metadata.issuer,
        issuanceDate: new Date(Number(metadata.issuanceDate) * 1000),
        metadataURI: metadata.metadataURI
      };
    } catch (error) {
      console.error('Error getting credit details:', error);
      return null;
    }
  }

  async getRetirementHistory(tokenId: number): Promise<RetirementCertificate[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const retirements = await this.contract.getRetirementHistory(tokenId);
      
      return retirements.map((retirement: any, index: number) => ({
        tokenId: Number(retirement.tokenId),
        quantity: Number(retirement.quantity),
        retiree: retirement.retiree,
        reason: retirement.reason,
        timestamp: new Date(Number(retirement.timestamp) * 1000),
        txHash: '', // We'd need to track this separately
        certificateId: `CERT-${tokenId}-${index}`
      }));
    } catch (error) {
      console.error('Error getting retirement history:', error);
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