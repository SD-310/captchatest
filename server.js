const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (e.g., your HTML file)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// reCAPTCHA secret key (store in environment variables for production)
const RECAPTCHA_SECRET_KEY = 'YOUR_RECAPTCHA_SECRET_KEY'; // Replace with your secret key

// Handle reCAPTCHA verification
app.post('/verify', async (req, res) => {
  const recaptchaResponse = req.body['g-recaptcha-response'];

  // Check if reCAPTCHA response is provided
  if (!recaptchaResponse) {
    return res.status(400).json({
      success: false,
      message: 'Please complete the reCAPTCHA.'
    });
  }

  try {
    // Make POST request to Google's reCAPTCHA verification API
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await axios.post(verificationURL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaResponse,
        remoteip: req.ip // Optional: include user's IP for better verification
      }
    });

    const { success, hostname, 'error-codes': errorCodes } = verificationResponse.data;

    if (success) {
      // Verification successful
      return res.json({
        success: true,
        message: 'reCAPTCHA verification successful.'
      });
    } else {
      // Verification failed
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed.',
        errors: errorCodes || ['invalid-input-response']
      });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during reCAPTCHA verification.',
      errors: [error.message]
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
