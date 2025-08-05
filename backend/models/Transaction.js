const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['issuance', 'transfer', 'retirement'],
    required: true
  },
  tokenId: {
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  blockTimestamp: {
    type: Date,
    required: true
  },
  gasUsed: Number,
  gasPrice: String,
  reason: String, // For retirements
  metadata: {
    projectId: String,
    vintage: String,
    serialNumber: String
  }
}, {
  timestamps: true
});

transactionSchema.index({ txHash: 1 });
transactionSchema.index({ tokenId: 1 });
transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ blockTimestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);