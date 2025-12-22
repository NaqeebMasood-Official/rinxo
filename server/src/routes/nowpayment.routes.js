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

// Simple auth middleware
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.user_id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

nowPaymentRoute.get('/status', getStatus);
nowPaymentRoute.get('/currencies', getCurrencies);
nowPaymentRoute.get('/min-amount/:currency', getMinAmount);
nowPaymentRoute.post('/estimate', estimatePrice);

nowPaymentRoute.post('/create-payment', authenticateUser, createPayment);
nowPaymentRoute.get('/payment-status/:payment_id', authenticateUser, getPaymentStatus);
nowPaymentRoute.get('/payments', authenticateUser, getPayments);
nowPaymentRoute.get('/transactions', authenticateUser, getTransactions);
nowPaymentRoute.get('/balance', authenticateUser, getBalance);

nowPaymentRoute.post('/ipn-callback', ipnCallback);

export default nowPaymentRoute;
