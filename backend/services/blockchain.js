const { ethers } = require('ethers');
const CarbonCreditABI = require('../contracts/CarbonCredit.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.NODE_ENV === 'production' 
        ? process.env.POLYGON_RPC_URL 
        : process.env.MUMBAI_RPC_URL
    );
    
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CarbonCreditABI.abi,
      this.wallet
    );
  }

  async issueCarbonCredit(
    to,
    quantity,
    projectId,
    vintage,
    serialNumber,
    registry,
    metadataURI
  ) {
    try {
      const tx = await this.contract.issueCarbonCredit(
        to,
        quantity,
        projectId,
        vintage,
        serialNumber,
        registry,
        metadataURI
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const event = receipt.logs.find(log => 
        log.topics[0] === ethers.id("CreditIssued(uint256,address,address,uint256,string,string)")
      );
      
      const tokenId = parseInt(event.topics[1], 16);

      return {
        tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error issuing carbon credit:', error);
      throw error;
    }
  }

  async getCreditMetadata(tokenId) {
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

  async getBalance(address, tokenId) {
    try {
      const balance = await this.contract.balanceOf(address, tokenId);
      return Number(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getTotalSupply(tokenId) {
    try {
      const supply = await this.contract.totalSupply(tokenId);
      return Number(supply);
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw error;
    }
  }

  async getRetirementHistory(tokenId) {
    try {
      const retirements = await this.contract.getRetirementHistory(tokenId);
      return retirements.map(retirement => ({
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

  async grantIssuerRole(address) {
    try {
      const ISSUER_ROLE = await this.contract.ISSUER_ROLE();
      const tx = await this.contract.grantRole(ISSUER_ROLE, address);
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error granting issuer role:', error);
      throw error;
    }
  }

  async hasIssuerRole(address) {
    try {
      const ISSUER_ROLE = await this.contract.ISSUER_ROLE();
      return await this.contract.hasRole(ISSUER_ROLE, address);
    } catch (error) {
      console.error('Error checking issuer role:', error);
      throw error;
    }
  }

  // Event listeners for real-time updates
  setupEventListeners() {
    // Listen for credit issuance
    this.contract.on('CreditIssued', (tokenId, issuer, recipient, quantity, projectId, vintage, event) => {
      console.log('Credit Issued:', {
        tokenId: Number(tokenId),
        issuer,
        recipient,
        quantity: Number(quantity),
        projectId,
        vintage,
        transactionHash: event.transactionHash
      });
      // Handle the event (update database, notify clients, etc.)
    });

    // Listen for credit retirement
    this.contract.on('CreditRetired', (tokenId, retiree, quantity, reason, event) => {
      console.log('Credit Retired:', {
        tokenId: Number(tokenId),
        retiree,
        quantity: Number(quantity),
        reason,
        transactionHash: event.transactionHash
      });
      // Handle the event
    });

    // Listen for transfers
    this.contract.on('TransferSingle', (operator, from, to, id, value, event) => {
      console.log('Transfer:', {
        operator,
        from,
        to,
        tokenId: Number(id),
        quantity: Number(value),
        transactionHash: event.transactionHash
      });
      // Handle the event
    });
  }
}

module.exports = new BlockchainService();