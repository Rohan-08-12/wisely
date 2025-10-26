const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const plaidRoutes = require('./routes/plaid');
const goalsRoutes = require('./routes/goals');
const transactionsRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const notificationsRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');

const { errorHandler } = require('./middleware/errorHandler');
const { authenticateUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/plaid', authenticateUser, plaidRoutes); // Add authentication
app.use('/api/goals', authenticateUser, goalsRoutes);
app.use('/api/transactions', authenticateUser, transactionsRoutes);
app.use('/api/dashboard', authenticateUser, dashboardRoutes);
app.use('/api/notifications', authenticateUser, notificationsRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Wisely backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});

module.exports = app;

