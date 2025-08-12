const mqtt = require('mqtt');
const { emitDeviceUpdate } = require('./realtime');

let mqttClient = null;
let mode = process.env.IOT_MODE || 'mqtt'; // default to MQTT for real hardware

function ensureMqtt() {
  if (mqttClient || mode !== 'mqtt') return mqttClient;
  const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
  const options = {};
  if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
  if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;
  mqttClient = mqtt.connect(url, options);
  mqttClient.on('connect', () => console.log('[IoT] Connected to MQTT'));
  mqttClient.on('error', (err) => console.error('[IoT] MQTT error', err));
  // Listen for device state topics to update clients in real-time (optional convention)
  mqttClient.on('message', (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      // Expected topic: ecosync/<location>/<name>/state
      const parts = topic.split('/');
      if (parts.length >= 4 && parts[0] === 'ecosync' && parts[3] === 'state') {
        emitDeviceUpdate({ topic, payload });
      }
    } catch (_) {}
  });
  return mqttClient;
}

async function sendLightCommand(device, isActive) {
  if (mode === 'mqtt') {
    const client = ensureMqtt();
    const topic = device.topicPath || `ecosync/${device.location}/${device.name}/set`;
    const payload = JSON.stringify({ state: isActive ? 'ON' : 'OFF' });
    client.publish(topic, payload, { qos: 1 });
    return { ok: true };
  }
  if (mode === 'http') {
    const base = device.httpEndpoint || process.env.IOT_HTTP_BASE; // device endpoint takes precedence
    if (!base) return { ok: false, error: 'IOT_HTTP_BASE not set' };
    try {
      const axios = require('axios');
      const url = device.httpEndpoint ? `${device.httpEndpoint}/toggle` : `${base}/devices/${device.name}/toggle`;
      await axios.post(url, { isActive });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  // mock
  console.log(`[IoT] mock light cmd => ${device.name} -> ${isActive ? 'ON' : 'OFF'}`);
  return { ok: true, mock: true };
}

module.exports = { sendLightCommand };
