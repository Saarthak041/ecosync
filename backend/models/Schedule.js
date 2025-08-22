const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  name: { type: String },
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  action: { type: String, enum: ['toggle', 'thermostat'], required: true },
  payload: {
    isActive: { type: Boolean },
    targetTemp: { type: Number },
  },
  cron: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  lastRunAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);


