const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Device = require('../models/Device');
const iot = require('../services/iot');

// Validation schemas
const toggleSchema = Joi.object({
  isActive: Joi.boolean().required()
});

const thermostatSchema = Joi.object({
  targetTemp: Joi.number().min(10).max(35).required()
});

// List devices
router.get('/', async (req, res, next) => {
  try {
    const devices = await Device.find().sort({ createdAt: 1 });
    res.json({ devices });
  } catch (err) { next(err); }
});

// Create a device (for setup/testing)
router.post('/', async (req, res, next) => {
  try {
    const device = await Device.create(req.body);
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

    // Send command to device
    const result = await iot.sendLightCommand(device, value.isActive);
    if (!result.ok) return res.status(502).json({ error: result.error || 'IoT command failed' });

    device.isActive = value.isActive;
    await device.save();

    res.json({ device });
  } catch (err) { next(err); }
});

// Set thermostat temperature
router.patch('/:id/thermostat', async (req, res, next) => {
  try {
    const { error, value } = thermostatSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.type !== 'thermostat') return res.status(400).json({ error: 'Not a thermostat' });

    const result = await iot.setThermostat(device, value.targetTemp);
    if (!result.ok) return res.status(502).json({ error: result.error || 'IoT command failed' });

    // Persist latest setting
    device.isActive = true;
    device.energyUsage = `${value.targetTemp}C`;
    await device.save();

    res.json({ device });
  } catch (err) { next(err); }
});

module.exports = router;
