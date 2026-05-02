require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

// Import routes
const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/routes/apis');
const gatewayRoutes = require('./src/routes/gateway');
const billingRoutes = require('./src/routes/billing');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to databases
connectDB();
connectRedis();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Webhook payload needs raw body, so define this BEFORE express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gateway Route (Needs to be defined so it catches /gateway/*)
app.use('/gateway', gatewayRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
