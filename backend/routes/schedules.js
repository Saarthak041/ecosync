const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Schedule = require('../models/Schedule');
const scheduler = require('../services/scheduler');

const scheduleSchema = Joi.object({
  name: Joi.string().allow(''),
  device: Joi.string().required(),
  action: Joi.string().valid('toggle').required(),
  payload: Joi.object({
    isActive: Joi.boolean(),
  }).default({}),
  cron: Joi.string().required(),
  enabled: Joi.boolean().default(true),
});

router.get('/', async (req, res, next) => {
  try {
    const items = await Schedule.find({}).sort({ createdAt: -1 }).populate('device');
    res.json({ schedules: items });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { error, value } = scheduleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const created = await Schedule.create(value);
    await scheduler.upsertAndSchedule(created);
    res.status(201).json({ schedule: created });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { error, value } = scheduleSchema.min(1).validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const updated = await Schedule.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updated) return res.status(404).json({ error: 'Schedule not found' });
    await scheduler.upsertAndSchedule(updated);
    res.json({ schedule: updated });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const removed = await Schedule.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Schedule not found' });
    scheduler.stopTask(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;


