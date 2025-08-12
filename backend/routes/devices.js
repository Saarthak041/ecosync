const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Device = require('../models/Device');
const iot = require('../services/iot');

// Validation schemas
const toggleSchema = Joi.object({
  isActive: Joi.boolean().required()
});

const deviceSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  type: Joi.string().valid('light', 'plug', 'fan', 'other').required(),
  topicPath: Joi.string().optional(),
  httpEndpoint: Joi.string().uri().optional(),
  ratedWatts: Joi.number().positive().optional()
});

// List devices (with optional user filtering)
router.get('/', async (req, res, next) => {
  try {
    // TODO: Add user filtering when auth is implemented
    // const userId = req.user?.userId;
    // const filter = userId ? { userId } : {};
    
    const devices = await Device.find().sort({ createdAt: 1 });
    res.json({ devices });
  } catch (err) { next(err); }
});

// Create a device (for setup/testing)
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = deviceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // TODO: Add user association when auth is implemented
    // value.userId = req.user?.userId;

    const device = await Device.create(value);
    res.status(201).json({ device });
  } catch (err) { next(err); }
});

// Toggle a device on/off
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const { error, value } = toggleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // TODO: Add user ownership check when auth is implemented
    // if (device.userId !== req.user?.userId) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    // Send command to device
    const result = await iot.sendLightCommand(device, value.isActive);
    if (!result.ok) return res.status(502).json({ error: result.error || 'IoT command failed' });

    device.isActive = value.isActive;
    await device.save();
    try { require('../services/realtime').emitDeviceUpdate(device.toObject()); } catch (_) {}
    try { require('../services/firebase').setDeviceState(device.toObject()); } catch (_) {}

    res.json({ device });
  } catch (err) { next(err); }
});

// Update device details
router.patch('/:id', async (req, res, next) => {
  try {
    const { error, value } = deviceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // TODO: Add user ownership check when auth is implemented
    // if (device.userId !== req.user?.userId) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    Object.assign(device, value);
    await device.save();

    res.json({ device });
  } catch (err) { next(err); }
});

// Delete device
router.delete('/:id', async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // TODO: Add user ownership check when auth is implemented
    // if (device.userId !== req.user?.userId) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    await Device.findByIdAndDelete(req.params.id);
    res.json({ message: 'Device deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
