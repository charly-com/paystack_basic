const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors'); // Add cors package

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Define allowed origins
const allowedOrigins = [
  'https://staging--staging-educenter.netlify.app',
  'https://educenter.com.ng'
];

// Configure CORS to allow multiple origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Route to create a Paystack transaction
app.post('/paystack/transaction', async (req, res) => {
  const { email, amount } = req.body;

  // Ensure the amount is in kobo (100 kobo = 1 Naira)
  const amountInKobo = amount * 100;

  try {
    // Call Paystack API to initialize the transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // If successful, return the authorization URL and reference
    if (response.data.status === 'success') {
      return res.json({
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      });
    } else {
      return res.status(400).json({ message: 'Transaction initialization failed' });
    }
  } catch (error) {
    console.error('Paystack transaction error:', error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

// Route to verify the transaction after the user completes payment
app.post('/paystack/verify', async (req, res) => {
  const { reference } = req.body;

  try {
    // Call Paystack API to verify the transaction
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // Check if the transaction is successful
    if (response.data.data.status === 'success') {
      return res.json({ message: 'Payment successful', data: response.data });
    } else {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});