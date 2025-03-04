const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

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
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { email, amount: amountInKobo },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if Paystack returned a success status (true)
    if (response.data.status === true) {
      return res.json({
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      });
    } else {
      console.error('Paystack API response:', response.data);
      return res.status(400).json({ message: 'Transaction initialization failed', details: response.data });
    }
  } catch (error) {
    console.error('Paystack transaction error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'An error occurred', details: error.response?.data });
  }
});

// Route to verify the transaction after the user completes payment
app.post('/paystack/verify', async (req, res) => {
  const { reference } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

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