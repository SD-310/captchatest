const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname)); // Serve static files from root

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html from root
});


const RECAPTCHA_SECRET_KEY = '6Ld9f5orAAAAALL93PkwsPrI5IusE_XS72rxh9QX';

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
    // Make POST request for reCAPTCHA verification
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    const verificationResponse = await axios.post(verificationURL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaResponse,
        
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


