const express = require('express');
const router = express.Router();
const CarbonCredit = require('../models/CarbonCredit');
const blockchainService = require('../services/blockchain');
const ipfsService = require('../services/ipfs');
const { body, validationResult } = require('express-validator');

// Get all carbon credits
router.get('/', async (req, res) => {
  try {
    const { owner, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (owner) filter.currentOwner = owner.toLowerCase();
    if (status) filter.status = status;

    const credits = await CarbonCredit.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CarbonCredit.countDocuments(filter);

    res.json({
      credits,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// Get specific carbon credit
router.get('/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const credit = await CarbonCredit.findOne({ tokenId });
    if (!credit) {
      return res.status(404).json({ error: 'Credit not found' });
    }

    // Get current balance from blockchain
    const balance = await blockchainService.getBalance(credit.currentOwner, tokenId);
    const totalSupply = await blockchainService.getTotalSupply(tokenId);

    res.json({
      ...credit.toObject(),
      currentBalance: balance,
      totalSupply
    });
  } catch (error) {
    console.error('Error fetching credit:', error);
    res.status(500).json({ error: 'Failed to fetch credit' });
  }
});

// Issue new carbon credit
router.post('/issue', [
  body('to').isEthereumAddress().withMessage('Invalid recipient address'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive integer'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('vintage').notEmpty().withMessage('Vintage is required'),
  body('serialNumber').notEmpty().withMessage('Serial number is required'),
  body('registry').notEmpty().withMessage('Registry is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      to,
      quantity,
      projectId,
      vintage,
      serialNumber,
      registry,
      name,
      description,
      imageUrl,
      location,
      sdgs,
      methodology,
      verifier
    } = req.body;

    // Create metadata and upload to IPFS
    const metadataURI = await ipfsService.createCarbonCreditMetadata({
      name,
      description,
      imageUrl,
      projectId,
      vintage,
      serialNumber,
      registry,
      quantity,
      location,
      methodology,
      verifier,
      sdgs,
      issuanceDate: new Date().toISOString(),
      issuer: req.user?.address || 'system'
    });

    // Issue on blockchain
    const result = await blockchainService.issueCarbonCredit(
      to,
      quantity,
      projectId,
      vintage,
      serialNumber,
      registry,
      metadataURI
    );

    // Save to database
    const credit = new CarbonCredit({
      tokenId: result.tokenId,
      name,
      projectId,
      vintage,
      quantity,
      serialNumber,
      registry,
      status: 'active',
      issuer: req.user?.address || 'system',
      currentOwner: to.toLowerCase(),
      issuanceDate: new Date(),
      metadataURI,
      imageUrl,
      metadata: {
        description,
        location,
        sdgs,
        methodology,
        verifier
      },
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber
    });

    await credit.save();

    res.status(201).json({
      success: true,
      credit,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Error issuing credit:', error);
    res.status(500).json({ error: 'Failed to issue credit' });
  }
});

// Get user's carbon credit portfolio
router.get('/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const credits = await CarbonCredit.find({ 
      currentOwner: address.toLowerCase(),
      status: 'active'
    });

    // Get current balances from blockchain
    const portfolio = await Promise.all(
      credits.map(async (credit) => {
        const balance = await blockchainService.getBalance(address, credit.tokenId);
        return {
          ...credit.toObject(),
          currentBalance: balance
        };
      })
    );

    const totalCredits = portfolio.reduce((sum, credit) => sum + credit.currentBalance, 0);

    res.json({
      portfolio,
      totalCredits,
      totalProjects: portfolio.length
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get retirement history for a credit
router.get('/:tokenId/retirements', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const retirements = await blockchainService.getRetirementHistory(tokenId);
    
    res.json({ retirements });
  } catch (error) {
    console.error('Error fetching retirements:', error);
    res.status(500).json({ error: 'Failed to fetch retirements' });
  }
});

module.exports = router;