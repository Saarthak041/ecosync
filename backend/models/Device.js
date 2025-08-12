const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: 'Unknown' },
  type: { type: String, enum: ['light', 'plug', 'fan', 'other'], default: 'light' },
  isOnline: { type: Boolean, default: true },
  isActive: { type: Boolean, default: false },
  energyUsage: { type: String, default: '0W' },
  ratedWatts: { type: Number, min: 0 }, // For unmetered devices (runtime × watts calculation)
  // Optional integration fields
  topicPath: { type: String }, // e.g., ecosync/living-room/light1
  httpEndpoint: { type: String }, // e.g., http://192.168.1.42/api/light1
  // User association (when auth is implemented)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Hardware metadata
  hardwareId: { type: String }, // ESP32 device identifier
  lastSeen: { type: Date, default: Date.now },
  // Energy tracking
  totalEnergyWh: { type: Number, default: 0 }, // Cumulative energy consumption
  lastEnergyUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for performance
DeviceSchema.index({ userId: 1 });
DeviceSchema.index({ hardwareId: 1 });
DeviceSchema.index({ location: 1 });

module.exports = mongoose.model('Device', DeviceSchema);
