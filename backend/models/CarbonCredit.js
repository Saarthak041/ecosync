const mongoose = require('mongoose');

const carbonCreditSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  vintage: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  registry: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'retired'],
    default: 'active'
  },
  issuer: {
    type: String,
    required: true
  },
  currentOwner: {
    type: String,
    required: true
  },
  issuanceDate: {
    type: Date,
    required: true
  },
  metadataURI: {
    type: String,
    required: true
  },
  imageUrl: String,
  metadata: {
    description: String,
    location: String,
    sdgs: [String],
    methodology: String,
    verifier: String
  },
  transactionHash: {
    type: String,
    required: true
  },
  blockNumber: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

carbonCreditSchema.index({ tokenId: 1 });
carbonCreditSchema.index({ projectId: 1 });
carbonCreditSchema.index({ currentOwner: 1 });
carbonCreditSchema.index({ status: 1 });

module.exports = mongoose.model('CarbonCredit', carbonCreditSchema);