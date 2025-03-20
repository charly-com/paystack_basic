const express = require('express');
const cors = require('cors');
require('dotenv').config();

const paystackRoutes = require('./routes/paystack');
const blogRoutes = require('./routes/blog');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://staging--staging-educenter.netlify.app',
      'https://educenter.com.ng',
      'http://localhost:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/paystack', paystackRoutes);
app.use('/blogs', blogRoutes);
app.use('/users', userRoutes);

module.exports = app;