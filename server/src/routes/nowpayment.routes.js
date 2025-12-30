import express from 'express';
import {
  getStatus,
  getCurrencies,
  getMinAmount,
  estimatePrice,
  createPayment,
  getPaymentStatus,
  getPayments,
  getTransactions,
  getBalance,
  ipnCallback,
} from '../controllers/nowpayment.controller.js';

const nowPaymentRoute = express.Router();

// ================= AUTH MIDDLEWARE =================
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.user_id;
  
  if (!userId) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'User ID is required in headers or body' 
    });
  }
  
  req.userId = userId;
  next();
};

// ================= PUBLIC ROUTES =================
// These routes don't require authentication

// Test endpoint to verify API configuration
nowPaymentRoute.get('/test-config', (req, res) => {
  res.json({
    apiKeySet: !!process.env.NOWPAYMENTS_API_KEY,
    sandbox: process.env.NOWPAYMENTS_SANDBOX === 'true',
    apiUrl: process.env.NOWPAYMENTS_SANDBOX === 'true' 
      ? 'https://api-sandbox.nowpayments.io/v1'
      : 'https://api.nowpayments.io/v1'
  });
});

// Check API status
nowPaymentRoute.get('/status', getStatus);

// Get available currencies
nowPaymentRoute.get('/currencies', getCurrencies);

// Get minimum amount for a currency
nowPaymentRoute.get('/min-amount/:currency', getMinAmount);

// Get price estimation
nowPaymentRoute.post('/estimate', estimatePrice);

// IPN callback from NOWPayments (webhook)
nowPaymentRoute.post('/ipn-callback', ipnCallback);

// ================= PROTECTED ROUTES =================
// These routes require user authentication

// Create a new payment
nowPaymentRoute.post('/create-payment', authenticateUser, createPayment);

// Get status of a specific payment
nowPaymentRoute.get('/payment-status/:payment_id', authenticateUser, getPaymentStatus);

// Get all payments for a user
nowPaymentRoute.get('/payments', authenticateUser, getPayments);

// Get all transactions for a user
nowPaymentRoute.get('/transactions', authenticateUser, getTransactions);

// Get user's balance
nowPaymentRoute.get('/balance', authenticateUser, getBalance);

export default nowPaymentRoute;