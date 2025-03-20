const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');

router.post('/transaction', async (req, res) => {
  const { email, amount, reference } = req.body;
  const amountInKobo = amount * 100;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { email, amount: amountInKobo, reference },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      return res.json({
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      });
    }
    return res.status(400).json({ message: 'Transaction initialization failed', details: response.data });
  } catch (error) {
    console.error('Paystack transaction error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'An error occurred', details: error.response?.data });
  }
});

router.post('/verify', async (req, res) => {
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
      const email = response.data.data.customer.email;
      await User.findOneAndUpdate(
        { email },
        { isSubscribed: true, updatedAt: Date.now() },
        { new: true }
      );
      return res.json({ message: 'Payment successful', data: response.data });
    }
    return res.status(400).json({ message: 'Payment verification failed' });
  } catch (error) {
    console.error('Paystack verification error:', error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

module.exports = router;

// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// router.post('/transaction', async (req, res) => {
//   const { email, amount, reference } = req.body;
//   const amountInKobo = amount * 100;

//   try {
//     const response = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       { email, amount: amountInKobo, reference },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (response.data.status) {
//       return res.json({
//         authorization_url: response.data.data.authorization_url,
//         reference: response.data.data.reference,
//       });
//     }
//     return res.status(400).json({ message: 'Transaction initialization failed', details: response.data });
//   } catch (error) {
//     console.error('Paystack transaction error:', error.response?.data || error.message);
//     return res.status(500).json({ message: 'An error occurred', details: error.response?.data });
//   }
// });

// router.post('/verify', async (req, res) => {
//   const { reference } = req.body;

//   try {
//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     if (response.data.data.status === 'success') {
//       return res.json({ message: 'Payment successful', data: response.data });
//     }
//     return res.status(400).json({ message: 'Payment verification failed' });
//   } catch (error) {
//     console.error('Paystack verification error:', error);
//     return res.status(500).json({ message: 'An error occurred' });
//   }
// });

// module.exports = router;