const mqtt = require('mqtt');

let mqttClient = null;
let mode = process.env.IOT_MODE || 'mock'; // 'mqtt' | 'http' | 'mock'

function ensureMqtt() {
  if (mqttClient || mode !== 'mqtt') return mqttClient;
  const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
  const options = {};
  if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
  if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;
  mqttClient = mqtt.connect(url, options);
  mqttClient.on('connect', () => console.log('[IoT] Connected to MQTT'));
  mqttClient.on('error', (err) => console.error('[IoT] MQTT error', err));
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

async function setThermostat(device, targetTemp) {
  if (mode === 'mqtt') {
    const client = ensureMqtt();
    const topic = device.topicPath || `ecosync/${device.location}/${device.name}/thermostat`;
    const payload = JSON.stringify({ target: targetTemp });
    client.publish(topic, payload, { qos: 1 });
    return { ok: true };
  }
  if (mode === 'http') {
    const base = device.httpEndpoint || process.env.IOT_HTTP_BASE;
    if (!base) return { ok: false, error: 'IOT_HTTP_BASE not set' };
    try {
      const axios = require('axios');
      const url = device.httpEndpoint ? `${device.httpEndpoint}/thermostat` : `${base}/devices/${device.name}/thermostat`;
      await axios.post(url, { targetTemp });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  console.log(`[IoT] mock thermostat => ${device.name} -> ${targetTemp}C`);
  return { ok: true, mock: true };
}

module.exports = { sendLightCommand, setThermostat };
