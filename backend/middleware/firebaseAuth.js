module.exports = async function firebaseAuth(req, res, next) {
  try {
    const required = process.env.FIREBASE_AUTH_REQUIRED === 'true';
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      if (required) return res.status(401).json({ error: 'Missing Authorization header' });
      return next();
    }
    const token = match[1];
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      try { require('../services/firebase').init(); } catch (_) {}
    }
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (e) {
    const required = process.env.FIREBASE_AUTH_REQUIRED === 'true';
    if (required) return res.status(401).json({ error: 'Invalid token' });
    return next();
  }
}


