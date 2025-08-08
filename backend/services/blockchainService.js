const { ethers } = require('ethers');
require('dotenv').config();

// Carbon Credit Contract ABI
const CARBON_CREDIT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getCreditMetadata(uint256 tokenId) view returns (tuple(string projectId, string vintage, string serialNumber, string registry, string metadataURI, address issuer, uint256 issuanceDate, bool isRetired))",
  "function getRetirementHistory(uint256 tokenId) view returns (tuple(uint256 tokenId, uint256 quantity, address retiree, string reason, uint256 timestamp)[])",
  "function totalSupply(uint256 id) view returns (uint256)",
  "function issueCarbonCredit(address to, uint256 quantity, string projectId, string vintage, string serialNumber, string registry, string metadataURI) returns (uint256)",
  "function retireCarbonCredit(uint256 tokenId, uint256 quantity, string reason)",
  "event CreditIssued(uint256 indexed tokenId, address indexed issuer, address indexed recipient, uint256 quantity, string projectId, string vintage)",
  "event CreditRetired(uint256 indexed tokenId, address indexed retiree, uint256 quantity, string reason)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)"
];

class BlockchainService {
  constructor() {
    this.providers = {
      polygon: new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/'),
      mumbai: new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com/'),
      ethereum: new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY')
    };

    this.contracts = {
      polygon: process.env.CONTRACT_ADDRESS_POLYGON,
      mumbai: process.env.CONTRACT_ADDRESS_MUMBAI,
      ethereum: process.env.CONTRACT_ADDRESS_ETHEREUM
    };

    // Create contract instances
    this.carbonContracts = {};
    Object.keys(this.providers).forEach(network => {
      if (this.contracts[network]) {
        this.carbonContracts[network] = new ethers.Contract(
          this.contracts[network],
          CARBON_CREDIT_ABI,
          this.providers[network]
        );
      }
    });

    // Initialize event listeners
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    Object.keys(this.carbonContracts).forEach(network => {
      const contract = this.carbonContracts[network];
      
      // Listen for credit issuance
      contract.on('CreditIssued', async (tokenId, issuer, recipient, quantity, projectId, vintage, event) => {
        console.log(`Credit issued on ${network}:`, {
          tokenId: tokenId.toString(),
          issuer,
          recipient,
          quantity: quantity.toString(),
          projectId,
          vintage,
          txHash: event.transactionHash
        });
        
        // Save to database
        await this.saveCreditIssuance({
          network,
          tokenId: tokenId.toString(),
          issuer,
          recipient,
          quantity: quantity.toString(),
          projectId,
          vintage,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      });

      // Listen for credit retirements
      contract.on('CreditRetired', async (tokenId, retiree, quantity, reason, event) => {
        console.log(`Credit retired on ${network}:`, {
          tokenId: tokenId.toString(),
          retiree,
          quantity: quantity.toString(),
          reason,
          txHash: event.transactionHash
        });
        
        // Save to database
        await this.saveCreditRetirement({
          network,
          tokenId: tokenId.toString(),
          retiree,
          quantity: quantity.toString(),
          reason,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      });

      // Listen for transfers
      contract.on('TransferSingle', async (operator, from, to, id, value, event) => {
        // Skip minting (from zero address) and burning (to zero address)
        if (from !== ethers.ZeroAddress && to !== ethers.ZeroAddress) {
          console.log(`Credit transferred on ${network}:`, {
            tokenId: id.toString(),
            from,
            to,
            quantity: value.toString(),
            txHash: event.transactionHash
          });
          
          // Save to database
          await this.saveCreditTransfer({
            network,
            tokenId: id.toString(),
            from,
            to,
            quantity: value.toString(),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      });
    });
  }

  async getUserPortfolio(address, network = 'polygon') {
    try {
      const contract = this.carbonContracts[network];
      if (!contract) {
        throw new Error(`Contract not available for network: ${network}`);
      }

      // This would typically come from indexed data
      // For now, we'll return mock data structure
      return {
        address,
        network,
        credits: [],
        totalValue: '0',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting user portfolio:', error);
      throw error;
    }
  }

  async getCreditDetails(tokenId, network = 'polygon') {
    try {
      const contract = this.carbonContracts[network];
      if (!contract) {
        throw new Error(`Contract not available for network: ${network}`);
      }

      const metadata = await contract.getCreditMetadata(tokenId);
      const totalSupply = await contract.totalSupply(tokenId);

      return {
        tokenId,
        network,
        projectId: metadata.projectId,
        vintage: metadata.vintage,
        serialNumber: metadata.serialNumber,
        registry: metadata.registry,
        metadataURI: metadata.metadataURI,
        issuer: metadata.issuer,
        issuanceDate: new Date(Number(metadata.issuanceDate) * 1000),
        isRetired: metadata.isRetired,
        totalSupply: totalSupply.toString()
      };
    } catch (error) {
      console.error('Error getting credit details:', error);
      throw error;
    }
  }

  async getRetirementHistory(tokenId, network = 'polygon') {
    try {
      const contract = this.carbonContracts[network];
      if (!contract) {
        throw new Error(`Contract not available for network: ${network}`);
      }

      const retirements = await contract.getRetirementHistory(tokenId);
      
      return retirements.map(retirement => ({
        tokenId: retirement.tokenId.toString(),
        quantity: retirement.quantity.toString(),
        retiree: retirement.retiree,
        reason: retirement.reason,
        timestamp: new Date(Number(retirement.timestamp) * 1000)
      }));
    } catch (error) {
      console.error('Error getting retirement history:', error);
      throw error;
    }
  }

  async estimateGas(method, params, network = 'polygon') {
    try {
      const contract = this.carbonContracts[network];
      if (!contract) {
        throw new Error(`Contract not available for network: ${network}`);
      }

      const gasEstimate = await contract[method].estimateGas(...params);
      const gasPrice = await this.providers[network].getFeeData();
      
      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        maxFeePerGas: gasPrice.maxFeePerGas?.toString() || '0',
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString() || '0'
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  // Database save methods (implement based on your database choice)
  async saveCreditIssuance(data) {
    // Implement database save logic
    console.log('Saving credit issuance:', data);
  }

  async saveCreditRetirement(data) {
    // Implement database save logic
    console.log('Saving credit retirement:', data);
  }

  async saveCreditTransfer(data) {
    // Implement database save logic
    console.log('Saving credit transfer:', data);
  }

  // Helper methods
  formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatTokenAmount(amount, decimals = 18) {
    return ethers.formatUnits(amount, decimals);
  }

  parseTokenAmount(amount, decimals = 18) {
    return ethers.parseUnits(amount.toString(), decimals);
  }
}

module.exports = BlockchainService;
