const admin = require('firebase-admin');

let initialized = false;

function init() {
  if (initialized) return;
  try {
    if (admin.apps.length) {
      initialized = true;
      return;
    }
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (base64) {
      const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(json),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    initialized = true;
    console.log('[Firebase] Initialized');
  } catch (e) {
    console.error('[Firebase] Init failed', e);
  }
}

function getFirestore() {
  if (!initialized) init();
  try { return admin.firestore(); } catch { return null; }
}

async function setDeviceState(device) {
  const db = getFirestore();
  if (!db) return;
  const doc = db.collection('devices').doc(device._id?.toString?.() || device.id || device._id);
  await doc.set({
    name: device.name,
    location: device.location,
    type: device.type,
    isOnline: device.isOnline,
    isActive: device.isActive,
    energyUsage: device.energyUsage || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function sendTopicNotification(topic, title, body, data) {
  if (!initialized) init();
  try {
    await admin.messaging().send({
      notification: { title, body },
      data: data || {},
      topic,
    });
  } catch (e) {
    console.error('[Firebase] sendTopicNotification failed', e?.message || e);
  }
}

module.exports = { init, setDeviceState, sendTopicNotification };


