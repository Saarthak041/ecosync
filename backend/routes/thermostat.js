const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Device = require('../models/Device');
const iot = require('../services/iot');

const setTempSchema = Joi.object({
  targetTemp: Joi.number().min(10).max(35).required()
});

router.get('/', async (req, res, next) => {
  try {
    const thermos = await Device.find({ type: 'thermostat' });
    res.json({ devices: thermos });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { error, value } = setTempSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.type !== 'thermostat') return res.status(400).json({ error: 'Not a thermostat' });

    const result = await iot.setThermostat(device, value.targetTemp);
    if (!result.ok) return res.status(502).json({ error: result.error || 'IoT command failed' });

    device.isActive = true;
    device.energyUsage = `${value.targetTemp}C`;
    await device.save();

    res.json({ device });
  } catch (err) { next(err); }
});

module.exports = router;
