const express = require('express');
const router = express.Router();
const { sendTopicNotification } = require('../services/firebase');
const firebaseAuth = require('../middleware/firebaseAuth');

// Optional auth (gated by FIREBASE_AUTH_REQUIRED)
router.post('/topic', firebaseAuth, async (req, res) => {
  const { topic, title, body, data } = req.body || {};
  if (!topic || !title) return res.status(400).json({ error: 'topic and title are required' });
  await sendTopicNotification(topic, title, body || '', data || {});
  res.json({ ok: true });
});

module.exports = router;


