const cron = require('node-cron');
const Schedule = require('../models/Schedule');
const Device = require('../models/Device');
const iot = require('./iot');

const scheduledTasks = new Map();

function stopTask(id) {
  const task = scheduledTasks.get(id);
  if (task) {
    task.stop();
    scheduledTasks.delete(id);
  }
}

async function executeSchedule(schedule) {
  const device = await Device.findById(schedule.device);
  if (!device) return;
  if (!schedule.enabled) return;

  if (schedule.action === 'toggle') {
    const isActive = !!schedule.payload?.isActive;
    const result = await iot.sendLightCommand(device, isActive);
    if (result.ok) {
      device.isActive = isActive;
      await device.save();
      try { require('./realtime').emitDeviceUpdate(device.toObject()); } catch (_) {}
      try { require('./firebase').setDeviceState(device.toObject()); } catch (_) {}
    }
  }
  schedule.lastRunAt = new Date();
  await schedule.save();
}

function startTask(schedule) {
  stopTask(schedule._id.toString());
  if (!schedule.enabled) return;
  const task = cron.schedule(schedule.cron, () => executeSchedule(schedule), { timezone: 'UTC' });
  scheduledTasks.set(schedule._id.toString(), task);
}

async function reloadAll() {
  const items = await Schedule.find({});
  items.forEach(startTask);
}

async function upsertAndSchedule(schedule) {
  startTask(schedule);
}

module.exports = {
  reloadAll,
  upsertAndSchedule,
  stopTask,
};


