const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/issuers', require('./routes/issuers'));
app.use('/api/metadata', require('./routes/metadata'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/notifications', require('./routes/notifications'));

// Root route for API discovery
app.get('/', (req, res) => {
  res.json({
    status: 'EcoSync API',
    endpoints: {
      devices: {
        list: 'GET /api/devices',
        create: 'POST /api/devices',
        toggle: 'PATCH /api/devices/:id/toggle { isActive }'
      },
      thermostat: {
        list: 'GET /api/thermostat',
        set: 'PATCH /api/thermostat/:id { targetTemp }'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start scheduler after server starts
  try {
    const scheduler = require('./services/scheduler');
    scheduler.reloadAll();
    console.log('Scheduler initialized');
  } catch (e) {
    console.error('Failed to start scheduler', e);
  }
  try {
    require('./services/firebase').init();
  } catch (e) {
    console.error('Failed to init firebase', e);
  }
});

// Initialize WebSocket (Socket.IO)
try {
  const { init } = require('./services/realtime');
  init(httpServer, process.env.CORS_ORIGIN || '*');
  console.log('Realtime initialized');
} catch (e) {
  console.error('Failed to init realtime', e);
}

module.exports = app;