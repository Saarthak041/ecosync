const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: 'Unknown' },
  type: { type: String, enum: ['light', 'plug', 'thermostat', 'other'], default: 'light' },
  isOnline: { type: Boolean, default: true },
  isActive: { type: Boolean, default: false },
  energyUsage: { type: String, default: '0W' },
  // Optional integration fields
  topicPath: { type: String }, // e.g., ecosync/living-room/light1
  httpEndpoint: { type: String }, // e.g., http://192.168.1.42/api/light1
}, { timestamps: true });

module.exports = mongoose.model('Device', DeviceSchema);
