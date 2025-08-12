const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' }
  },
  stats: {
    totalEmissions: { type: Number, default: 0 },
    devicesCount: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Index for email lookups
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
