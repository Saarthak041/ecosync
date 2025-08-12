const express = require('express');
const router = express.Router();

// Placeholder metadata routes
router.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
