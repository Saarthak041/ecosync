const express = require('express');
const router = express.Router();
const BlockchainService = require('../services/blockchainService');

const blockchainService = new BlockchainService();

/**
 * GET /api/blockchain/portfolio/:address
 * Get user's carbon credit portfolio
 */
router.get('/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { network = 'polygon' } = req.query;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const portfolio = await blockchainService.getUserPortfolio(address, network);
    
    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ 
      error: 'Failed to fetch portfolio',
      message: error.message 
    });
  }
});

/**
 * GET /api/blockchain/credit/:tokenId
 * Get specific carbon credit details
 */
router.get('/credit/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { network = 'polygon' } = req.query;

    const creditDetails = await blockchainService.getCreditDetails(tokenId, network);
    
    res.json({
      success: true,
      credit: creditDetails
    });
  } catch (error) {
    console.error('Error fetching credit details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch credit details',
      message: error.message 
    });
  }
});

/**
 * GET /api/blockchain/retirement-history/:tokenId
 * Get retirement history for a carbon credit
 */
router.get('/retirement-history/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { network = 'polygon' } = req.query;

    const retirements = await blockchainService.getRetirementHistory(tokenId, network);
    
    res.json({
      success: true,
      retirements
    });
  } catch (error) {
    console.error('Error fetching retirement history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch retirement history',
      message: error.message 
    });
  }
});

/**
 * POST /api/blockchain/estimate-gas
 * Estimate gas for blockchain transactions
 */
router.post('/estimate-gas', async (req, res) => {
  try {
    const { method, params, network = 'polygon' } = req.body;

    if (!method || !params) {
      return res.status(400).json({ error: 'Method and params are required' });
    }

    const gasEstimate = await blockchainService.estimateGas(method, params, network);
    
    res.json({
      success: true,
      gasEstimate
    });
  } catch (error) {
    console.error('Error estimating gas:', error);
    res.status(500).json({ 
      error: 'Failed to estimate gas',
      message: error.message 
    });
  }
});

/**
 * GET /api/blockchain/networks
 * Get supported networks and contract addresses
 */
router.get('/networks', (req, res) => {
  try {
    const networks = {
      polygon: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com/',
        blockExplorer: 'https://polygonscan.com/',
        nativeCurrency: 'MATIC',
        contractAddress: process.env.CONTRACT_ADDRESS_POLYGON || null
      },
      mumbai: {
        chainId: 80001,
        name: 'Mumbai Testnet',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
        blockExplorer: 'https://mumbai.polygonscan.com/',
        nativeCurrency: 'MATIC',
        contractAddress: process.env.CONTRACT_ADDRESS_MUMBAI || null
      },
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
        blockExplorer: 'https://etherscan.io/',
        nativeCurrency: 'ETH',
        contractAddress: process.env.CONTRACT_ADDRESS_ETHEREUM || null
      }
    };

    res.json({
      success: true,
      networks
    });
  } catch (error) {
    console.error('Error fetching networks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch networks',
      message: error.message 
    });
  }
});

/**
 * GET /api/blockchain/transaction/:txHash
 * Get transaction details
 */
router.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const { network = 'polygon' } = req.query;

    // This would integrate with your database to get transaction details
    // For now, return a placeholder
    res.json({
      success: true,
      transaction: {
        hash: txHash,
        network,
        status: 'confirmed',
        blockNumber: null,
        gasUsed: null,
        effectiveGasPrice: null
      }
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction',
      message: error.message 
    });
  }
});

/**
 * POST /api/blockchain/validate-address
 * Validate Ethereum address format
 */
router.post('/validate-address', (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    
    res.json({
      success: true,
      isValid,
      formatted: isValid ? blockchainService.formatAddress(address) : null
    });
  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({ 
      error: 'Failed to validate address',
      message: error.message 
    });
  }
});

module.exports = router;
