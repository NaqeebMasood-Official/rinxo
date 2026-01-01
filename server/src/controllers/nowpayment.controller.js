//  import { Payment, Transaction, UserBalance } from '../models/payment.models.js';
// import axios from 'axios';

// // NOWPayments API configuration
// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// // const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
// const NOWPAYMENTS_API_URL = 'https://api-sandbox.nowpayments.io/v1';

// // Axios instance
// const nowpaymentsRequest = axios.create({
//   baseURL: NOWPAYMENTS_API_URL,
//   headers: {
//     'x-api-key': NOWPAYMENTS_API_KEY,
//     'Content-Type': 'application/json',
//   },
// });

// // ================= STATUS =================
// export const getStatus = async (req, res) => {
//   try {
//     const response = await nowpaymentsRequest.get('/status');
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= CURRENCIES =================
// export const getCurrencies = async (req, res) => {
//   try {
//     const response = await nowpaymentsRequest.get('/currencies');
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getMinAmount = async (req, res) => {
//   try {
//     const { currency } = req.params;

//     const response = await nowpaymentsRequest.get(
//       `/min-amount?currency_from=usd&currency_to=${currency}`
//     );

//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= ESTIMATE =================
// export const estimatePrice = async (req, res) => {
//   try {
//     const { amount, currency_from, currency_to } = req.body;

//     if (!amount || !currency_from || !currency_to) {
//       return res.status(400).json({
//         error: "Missing required fields",
//       });
//     }

//     const parsedAmount = parseFloat(amount);

//     if (isNaN(parsedAmount) || parsedAmount < 10) {
//       return res.status(400).json({
//         error: "Invalid amount",
//         message: "Amount must be at least $10",
//       });
//     }

//     console.log("Estimate request:", {
//       amount: parsedAmount,
//       currency_from: currency_from.toLowerCase(),
//       currency_to: currency_to.toLowerCase(),
//     });

//     /**
//      * ✅ NOWPayments uses GET /estimate
//      * ✅ Query params must be inside `params`
//      */
//     const response = await nowpaymentsRequest.get("/estimate", {
//       params: {
//         amount: parsedAmount,
//         currency_from: currency_from.toLowerCase(),
//         currency_to: currency_to.toLowerCase(),
//       },
//     });

//     return res.json(response.data);

//   } catch (err) {
//     console.error(
//       "Estimate error:",
//       err.response?.data || err.message
//     );

//     if (err.response?.status === 403) {
//       return res.status(403).json({
//         error: "API Authentication Failed",
//         message:
//           "NOWPayments API key is invalid or unauthorized.",
//         details: err.response?.data,
//       });
//     }

//     if (err.response?.status === 400) {
//       return res.status(400).json({
//         error: "Invalid Request",
//         message:
//           err.response?.data?.message ||
//           "The amount or currency is invalid",
//         details: err.response?.data,
//       });
//     }

//     return res.status(500).json({
//       error: "Estimate failed",
//       message:
//         err.response?.data?.message || err.message,
//       details: err.response?.data,
//     });
//   }
// };


// // ================= CREATE PAYMENT =================
// export const createPayment = async (req, res) => {
//   try {
//     const {
//       price_amount,
//       price_currency,
//       pay_currency,
//       order_description,
//       ipn_callback_url,
//       success_url,
//       cancel_url,
//     } = req.body;

//     // Validation
//     if (!price_amount || !price_currency || !pay_currency) {
//       return res.status(400).json({ 
//         error: 'Missing required fields',
//         received: { price_amount, price_currency, pay_currency }
//       });
//     }

//     // Validate amount is a valid number
//     const parsedAmount = parseFloat(price_amount);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       return res.status(400).json({ 
//         error: 'Invalid price_amount',
//         message: 'Price amount must be a positive number'
//       });
//     }

//     const order_id = `DEP-${req.userId}-${Date.now()}`;

//     // Prepare payload for NOWPayments
//     const nowPaymentsPayload = {
//       price_amount: parsedAmount,
//       price_currency: price_currency.toLowerCase(),
//       pay_currency: pay_currency.toLowerCase(), // ✅ Ensure lowercase
//       order_id,
//       order_description: order_description || 'Wallet deposit',
//       ipn_callback_url,
//       success_url,
//       cancel_url,
//     };

//     console.log('Creating payment with NOWPayments:', nowPaymentsPayload);

//     const response = await nowpaymentsRequest.post('/payment', nowPaymentsPayload);

//     // Save payment to database
//     const payment = new Payment({
//       payment_id: response.data.payment_id,
//       order_id,
//       user_id: req.userId,
//       price_amount: response.data.price_amount,
//       price_currency: response.data.price_currency,
//       pay_amount: response.data.pay_amount,
//       pay_currency: response.data.pay_currency,
//       pay_address: response.data.pay_address,
//       payment_status: response.data.payment_status,
//       invoice_id: response.data.invoice_id,
//       metadata: { success_url, cancel_url },
//     });

//     await payment.save();

//     // Create transaction record
//     const transaction = new Transaction({
//       user_id: req.userId,
//       payment_id: response.data.payment_id,
//       type: 'deposit',
//       amount: parsedAmount,
//       currency: price_currency,
//       status: 'pending',
//       description: order_description || 'Crypto deposit',
//     });

//     await transaction.save();

//     res.json(response.data);
//   } catch (err) {
//     console.error('Payment creation error:', {
//       message: err.message,
//       response: err.response?.data,
//       status: err.response?.status
//     });

//     res.status(err.response?.status || 500).json({
//       error: 'Payment creation failed',
//       message: err.response?.data?.message || err.message,
//       details: err.response?.data,
//     });
//   }
// };

// // ================= PAYMENT STATUS =================
// export const getPaymentStatus = async (req, res) => {
//   try {
//     const { payment_id } = req.params;

//     const payment = await Payment.findOne({
//       payment_id,
//       user_id: req.userId,
//     });

//     if (!payment) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     const response = await nowpaymentsRequest.get(`/payment/${payment_id}`);

//     if (response.data.payment_status !== payment.payment_status) {
//       payment.payment_status = response.data.payment_status;
//       payment.actually_paid = response.data.actually_paid || payment.actually_paid;
//       payment.updated_at = new Date();
//       await payment.save();
//     }

//     res.json({
//       ...response.data,
//       transaction: await Transaction.findOne({ payment_id }),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= PAYMENTS LIST =================
// export const getPayments = async (req, res) => {
//   try {
//     const { limit = 10, page = 0, status } = req.query;

//     const query = { user_id: req.userId };
//     if (status) query.payment_status = status;

//     const payments = await Payment.find(query)
//       .sort({ created_at: -1 })
//       .limit(Number(limit))
//       .skip(Number(page) * Number(limit));

//     const total = await Payment.countDocuments(query);

//     res.json({
//       payments,
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= TRANSACTIONS =================
// export const getTransactions = async (req, res) => {
//   try {
//     const { limit = 10, page = 0, type } = req.query;

//     const query = { user_id: req.userId };
//     if (type) query.type = type;

//     const transactions = await Transaction.find(query)
//       .sort({ created_at: -1 })
//       .limit(Number(limit))
//       .skip(Number(page) * Number(limit));

//     const total = await Transaction.countDocuments(query);

//     res.json({
//       transactions,
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= BALANCE =================
// export const getBalance = async (req, res) => {
//   try {
//     let balance = await UserBalance.findOne({ user_id: req.userId });

//     if (!balance) {
//       balance = new UserBalance({ user_id: req.userId, balance: 0 });
//       await balance.save();
//     }

//     res.json(balance);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= IPN CALLBACK =================
// export const ipnCallback = async (req, res) => {
//   try {
//     const data = req.body;

//     console.log('IPN callback received:', data);

//     const payment = await Payment.findOne({ payment_id: data.payment_id });
//     if (!payment) {
//       console.error('Payment not found:', data.payment_id);
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     payment.payment_status = data.payment_status;
//     payment.actually_paid = data.actually_paid || payment.actually_paid;
//     payment.updated_at = new Date();

//     if (data.payment_status === 'finished') {
//       payment.confirmed_at = new Date();
//     }

//     await payment.save();

//     const transaction = await Transaction.findOne({
//       payment_id: data.payment_id,
//     });

//     if (transaction && data.payment_status === 'finished' && transaction.status !== 'completed') {
//       let userBalance = await UserBalance.findOne({ user_id: payment.user_id });

//       if (!userBalance) {
//         userBalance = new UserBalance({ user_id: payment.user_id, balance: 0 });
//       }

//       transaction.status = 'completed';
//       transaction.balance_before = userBalance.balance;

//       userBalance.balance += payment.price_amount;
//       transaction.balance_after = userBalance.balance;

//       await userBalance.save();
//       await transaction.save();

//       console.log('Balance updated:', {
//         userId: payment.user_id,
//         newBalance: userBalance.balance,
//         addedAmount: payment.price_amount
//       });
//     }

//     res.sendStatus(200);
//   } catch (err) {
//     console.error('IPN callback error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };



// import { Payment, Transaction, UserBalance } from '../models/payment.models.js';
// import axios from 'axios';

// // NOWPayments API configuration
// const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
// const NOWPAYMENTS_API_URL = 'https://api-sandbox.nowpayments.io/v1';
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// // Axios instance
// const nowpaymentsRequest = axios.create({
//   baseURL: NOWPAYMENTS_API_URL,
//   headers: {
//     'x-api-key': NOWPAYMENTS_API_KEY,
//     'Content-Type': 'application/json',
//   },
// });

// // ================= STATUS =================
// export const getStatus = async (req, res) => {
//   try {
//     const response = await nowpaymentsRequest.get('/status');
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= CURRENCIES =================
// export const getCurrencies = async (req, res) => {
//   try {
//     const response = await nowpaymentsRequest.get('/currencies');
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getMinAmount = async (req, res) => {
//   try {
//     const { currency } = req.params;
//     const response = await nowpaymentsRequest.get(
//       `/min-amount?currency_from=usd&currency_to=${currency}`
//     );
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= ESTIMATE =================
// export const estimatePrice = async (req, res) => {
//   try {
//     const { amount, currency_from, currency_to } = req.body;

//     if (!amount || !currency_from || !currency_to) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const parsedAmount = parseFloat(amount);
//     if (isNaN(parsedAmount) || parsedAmount < 10) {
//       return res.status(400).json({
//         error: "Invalid amount",
//         message: "Amount must be at least $10",
//       });
//     }

//     const response = await nowpaymentsRequest.get("/estimate", {
//       params: {
//         amount: parsedAmount,
//         currency_from: currency_from.toLowerCase(),
//         currency_to: currency_to.toLowerCase(),
//       },
//     });

//     return res.json(response.data);
//   } catch (err) {
//     console.error("Estimate error:", err.response?.data || err.message);
//     return res.status(err.response?.status || 500).json({
//       error: "Estimate failed",
//       message: err.response?.data?.message || err.message,
//     });
//   }
// };

// // ================= CREATE PAYMENT =================
// export const createPayment = async (req, res) => {
//   try {
//     const {
//       price_amount,
//       price_currency,
//       pay_currency,
//       order_description,
//     } = req.body;

//     if (!price_amount || !price_currency || !pay_currency) {
//       return res.status(400).json({ 
//         error: 'Missing required fields',
//         received: { price_amount, price_currency, pay_currency }
//       });
//     }

//     const parsedAmount = parseFloat(price_amount);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       return res.status(400).json({ 
//         error: 'Invalid price_amount',
//         message: 'Price amount must be a positive number'
//       });
//     }

//     const order_id = `DEP-${req.userId}-${Date.now()}`;

//     // Create dynamic URLs with payment tracking
//     const ipn_callback_url = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/payment/ipn-callback`;
//     const success_url = `${FRONTEND_URL}/payment-status?status=success?order_id=${order_id}`;
//     const cancel_url = `${FRONTEND_URL}/payment-status?status=cancel?order_id=${order_id}`;

//     const nowPaymentsPayload = {
//       price_amount: parsedAmount,
//       price_currency: price_currency.toLowerCase(),
//       pay_currency: pay_currency.toLowerCase(),
//       order_id,
//       order_description: order_description || 'Wallet deposit',
//       ipn_callback_url,
//       success_url,
//       cancel_url,
//     };

//     console.log('Creating payment with NOWPayments:', nowPaymentsPayload);

//     const response = await nowpaymentsRequest.post('/payment', nowPaymentsPayload);

//     // Save payment to database
//     const payment = new Payment({
//       payment_id: response.data.payment_id,
//       order_id,
//       user_id: req.userId,
//       price_amount: response.data.price_amount,
//       price_currency: response.data.price_currency,
//       pay_amount: response.data.pay_amount,
//       pay_currency: response.data.pay_currency,
//       pay_address: response.data.pay_address,
//       payment_status: response.data.payment_status,
//       invoice_id: response.data.invoice_id,
//       metadata: { 
//         success_url, 
//         cancel_url,
//         ipn_callback_url 
//       },
//     });

//     await payment.save();

//     // Create transaction record
//     const transaction = new Transaction({
//       user_id: req.userId,
//       payment_id: response.data.payment_id,
//       type: 'deposit',
//       amount: parsedAmount,
//       currency: price_currency,
//       status: 'pending',
//       description: order_description || 'Crypto deposit',
//     });

//     await transaction.save();

//     res.json({
//       ...response.data,
//       success_url,
//       cancel_url,
//       order_id
//     });
//   } catch (err) {
//     console.error('Payment creation error:', err.response?.data || err.message);
//     res.status(err.response?.status || 500).json({
//       error: 'Payment creation failed',
//       message: err.response?.data?.message || err.message,
//     });
//   }
// };

// // ================= PAYMENT STATUS =================
// export const getPaymentStatus = async (req, res) => {
//   try {
//     const { payment_id } = req.params;

//     const payment = await Payment.findOne({
//       payment_id,
//       user_id: req.userId,
//     });

//     if (!payment) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     const response = await nowpaymentsRequest.get(`/payment/${payment_id}`);

//     if (response.data.payment_status !== payment.payment_status) {
//       payment.payment_status = response.data.payment_status;
//       payment.actually_paid = response.data.actually_paid || payment.actually_paid;
//       payment.updated_at = new Date();
//       await payment.save();
//     }

//     res.json({
//       ...response.data,
//       transaction: await Transaction.findOne({ payment_id }),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= GET PAYMENT BY ORDER ID =================
// export const getPaymentByOrderId = async (req, res) => {
//   try {
//     const { order_id } = req.params;

//     const payment = await Payment.findOne({ order_id });

//     if (!payment) {
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     const transaction = await Transaction.findOne({ 
//       payment_id: payment.payment_id 
//     });

//     res.json({
//       payment,
//       transaction,
//       status: payment.payment_status,
//       balance_updated: transaction?.status === 'completed'
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= PAYMENTS LIST =================
// export const getPayments = async (req, res) => {
//   try {
//     const { limit = 10, page = 0, status } = req.query;

//     const query = { user_id: req.userId };
//     if (status) query.payment_status = status;

//     const payments = await Payment.find(query)
//       .sort({ created_at: -1 })
//       .limit(Number(limit))
//       .skip(Number(page) * Number(limit));

//     const total = await Payment.countDocuments(query);

//     res.json({
//       payments,
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= TRANSACTIONS =================
// export const getTransactions = async (req, res) => {
//   try {
//     const { limit = 10, page = 0, type } = req.query;

//     const query = { user_id: req.userId };
//     if (type) query.type = type;

//     const transactions = await Transaction.find(query)
//       .sort({ created_at: -1 })
//       .limit(Number(limit))
//       .skip(Number(page) * Number(limit));

//     const total = await Transaction.countDocuments(query);

//     res.json({
//       transactions,
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= BALANCE =================
// export const getBalance = async (req, res) => {
//   try {
//     let balance = await UserBalance.findOne({ user_id: req.userId });

//     if (!balance) {
//       balance = new UserBalance({ user_id: req.userId, balance: 0 });
//       await balance.save();
//     }

//     res.json(balance);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= IPN CALLBACK (WEBHOOK) =================
// export const ipnCallback = async (req, res) => {
//   try {
//     const data = req.body;
//     console.log('🔔 IPN Webhook received:', JSON.stringify(data, null, 2));

//     // Find payment in database
//     const payment = await Payment.findOne({ payment_id: data.payment_id });
//     if (!payment) {
//       console.error('❌ Payment not found:', data.payment_id);
//       return res.status(404).json({ error: 'Payment not found' });
//     }

//     // Update payment status
//     const oldStatus = payment.payment_status;
//     payment.payment_status = data.payment_status;
//     payment.actually_paid = data.actually_paid || payment.actually_paid;
//     payment.updated_at = new Date();

//     console.log(`📊 Payment status: ${oldStatus} → ${data.payment_status}`);

//     // Handle different payment statuses
//     switch (data.payment_status) {
//       case 'finished':
//         payment.confirmed_at = new Date();
//         await updateUserBalance(payment, data);
//         console.log('✅ Payment finished - Balance updated');
//         break;

//       case 'partially_paid':
//         console.log('⚠️ Payment partially paid');
//         await updateTransactionStatus(data.payment_id, 'partial');
//         break;

//       case 'failed':
//       case 'expired':
//         console.log('❌ Payment failed/expired');
//         await updateTransactionStatus(data.payment_id, 'failed');
//         break;

//       case 'refunded':
//         console.log('🔄 Payment refunded');
//         await handleRefund(payment);
//         break;

//       default:
//         console.log(`ℹ️ Payment status: ${data.payment_status}`);
//     }

//     await payment.save();

//     // Send success response to NOWPayments
//     res.status(200).json({ 
//       success: true, 
//       message: 'Webhook processed successfully' 
//     });

//   } catch (err) {
//     console.error('❌ IPN callback error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ================= HELPER FUNCTIONS =================

// async function updateUserBalance(payment, webhookData) {
//   try {
//     const transaction = await Transaction.findOne({
//       payment_id: payment.payment_id,
//     });

//     if (!transaction) {
//       console.error('Transaction not found for payment:', payment.payment_id);
//       return;
//     }

//     // Prevent double crediting
//     if (transaction.status === 'completed') {
//       console.log('⚠️ Transaction already completed, skipping balance update');
//       return;
//     }

//     let userBalance = await UserBalance.findOne({ user_id: payment.user_id });

//     if (!userBalance) {
//       userBalance = new UserBalance({ 
//         user_id: payment.user_id, 
//         balance: 0 
//       });
//     }

//     transaction.status = 'completed';
//     transaction.balance_before = userBalance.balance;
//     transaction.completed_at = new Date();

//     // Add amount to balance
//     userBalance.balance += payment.price_amount;
//     transaction.balance_after = userBalance.balance;

//     await userBalance.save();
//     await transaction.save();

//     console.log('💰 Balance updated:', {
//       userId: payment.user_id,
//       previousBalance: transaction.balance_before,
//       addedAmount: payment.price_amount,
//       newBalance: userBalance.balance
//     });

//   } catch (err) {
//     console.error('Error updating balance:', err);
//     throw err;
//   }
// }

// async function updateTransactionStatus(payment_id, status) {
//   try {
//     const transaction = await Transaction.findOne({ payment_id });
//     if (transaction && transaction.status !== 'completed') {
//       transaction.status = status;
//       transaction.updated_at = new Date();
//       await transaction.save();
//     }
//   } catch (err) {
//     console.error('Error updating transaction status:', err);
//   }
// }

// async function handleRefund(payment) {
//   try {
//     const transaction = await Transaction.findOne({
//       payment_id: payment.payment_id,
//     });

//     if (!transaction || transaction.status !== 'completed') {
//       console.log('No completed transaction to refund');
//       return;
//     }

//     let userBalance = await UserBalance.findOne({ user_id: payment.user_id });
    
//     if (userBalance && userBalance.balance >= payment.price_amount) {
//       userBalance.balance -= payment.price_amount;
//       await userBalance.save();

//       transaction.status = 'refunded';
//       transaction.updated_at = new Date();
//       await transaction.save();

//       console.log('💸 Refund processed:', {
//         userId: payment.user_id,
//         refundedAmount: payment.price_amount,
//         newBalance: userBalance.balance
//       });
//     }
//   } catch (err) {
//     console.error('Error handling refund:', err);
//   }
// }


import { Payment, Transaction, UserBalance } from '../models/payment.models.js';
import axios from 'axios';
import crypto from "crypto";
import User from '../models/User.model.js';

// NOWPayments API configuration
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api-sandbox.nowpayments.io/v1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'https://univalent-distractedly-dave.ngrok-free.dev';

// Axios instance
const nowpaymentsRequest = axios.create({
  baseURL: NOWPAYMENTS_API_URL,
  headers: {
    'x-api-key': NOWPAYMENTS_API_KEY,
    'Content-Type': 'application/json',
  },
});

// ================= STATUS =================
export const getStatus = async (req, res) => {
  try {
    const response = await nowpaymentsRequest.get('/status');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CURRENCIES =================
export const getCurrencies = async (req, res) => {
  try {
    const response = await nowpaymentsRequest.get('/currencies');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMinAmount = async (req, res) => {
  try {
    const { currency } = req.params;
    const response = await nowpaymentsRequest.get(
      `/min-amount?currency_from=usd&currency_to=${currency}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= ESTIMATE =================
export const estimatePrice = async (req, res) => {
  try {
    const { amount, currency_from, currency_to } = req.body;

    if (!amount || !currency_from || !currency_to) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be at least $10",
      });
    }

    const response = await nowpaymentsRequest.get("/estimate", {
      params: {
        amount: parsedAmount,
        currency_from: currency_from.toLowerCase(),
        currency_to: currency_to.toLowerCase(),
      },
    });

    return res.json(response.data);
  } catch (err) {
    console.error("Estimate error:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      error: "Estimate failed",
      message: err.response?.data?.message || err.message,
    });
  }
};

// ================= CREATE PAYMENT =================
export const createPayment = async (req, res) => {
  try {
    const {
      price_amount,
      price_currency,
      pay_currency,
      order_description,
    } = req.body;

    if (!price_amount || !price_currency || !pay_currency) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { price_amount, price_currency, pay_currency }
      });
    }

    const parsedAmount = parseFloat(price_amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid price_amount',
        message: 'Price amount must be a positive number'
      });
    }

    const order_id = `DEP-${req.userId}-${Date.now()}`;

    // ✅ FIXED: Correct URL format with & instead of double ?
    const ipn_callback_url = `${BACKEND_URL}/api/payment/ipn-callback`;
    const success_url = `${FRONTEND_URL}/dashboard/payment-status?status=success&order_id=${order_id}`;
    const cancel_url = `${FRONTEND_URL}/dashboard/payment-status?status=cancel&order_id=${order_id}`;

    const nowPaymentsPayload = {
      price_amount: parsedAmount,
      price_currency: price_currency.toLowerCase(),
      pay_currency: pay_currency.toLowerCase(),
      order_id,
      order_description: order_description || 'Wallet deposit',
      ipn_callback_url,
      success_url,
      cancel_url,
    };

    console.log('🔷 Creating payment with NOWPayments:', {
      ...nowPaymentsPayload,
      userId: req.userId
    });

    const response = await nowpaymentsRequest.post('/payment', nowPaymentsPayload);

    console.log('✅ Payment created:', {
      payment_id: response.data.payment_id,
      order_id,
      ipn_callback_url
    });

    // Save payment to database
    const payment = new Payment({
      payment_id: response.data.payment_id,
      order_id,
      user_id: req.userId,
      price_amount: response.data.price_amount,
      price_currency: response.data.price_currency,
      pay_amount: response.data.pay_amount,
      pay_currency: response.data.pay_currency,
      pay_address: response.data.pay_address,
      payment_status: response.data.payment_status,
      invoice_id: response.data.invoice_id,
      metadata: { 
        success_url, 
        cancel_url,
        ipn_callback_url 
      },
    });

    await payment.save();

    // Create transaction record
    const transaction = new Transaction({
      user_id: req.userId,
      payment_id: response.data.payment_id,
      type: 'deposit',
      amount: parsedAmount,
      currency: price_currency,
      status: 'pending',
      description: order_description || 'Crypto deposit',
    });

    await transaction.save();

    res.json({
      ...response.data,
      success_url,
      cancel_url,
      order_id
    });
  } catch (err) {
    console.error('❌ Payment creation error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: 'Payment creation failed',
      message: err.response?.data?.message || err.message,
    });
  }
};

// ================= PAYMENT STATUS =================
export const getPaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;

    const payment = await Payment.findOne({
      payment_id,
      user_id: req.userId,
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const response = await nowpaymentsRequest.get(`/payment/${payment_id}`);

    if (response.data.payment_status !== payment.payment_status) {
      payment.payment_status = response.data.payment_status;
      payment.actually_paid = response.data.actually_paid || payment.actually_paid;
      payment.updated_at = new Date();
      await payment.save();
    }

    res.json({
      ...response.data,
      transaction: await Transaction.findOne({ payment_id }),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET PAYMENT BY ORDER ID =================
export const getPaymentByOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;

    const payment = await Payment.findOne({ order_id });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const transaction = await Transaction.findOne({ 
      payment_id: payment.payment_id 
    });

    res.json({
      payment,
      transaction,
      status: payment.payment_status,
      balance_updated: transaction?.status === 'completed'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= PAYMENTS LIST =================
export const getPayments = async (req, res) => {
  try {
    const { limit = 10, page = 0, status } = req.query;

    const query = { user_id: req.userId };
    if (status) query.payment_status = status;

    const payments = await Payment.find(query)
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .skip(Number(page) * Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= TRANSACTIONS =================
export const getTransactions = async (req, res) => {
  try {
    const { limit = 10, page = 0, type } = req.query;

    const query = { user_id: req.userId };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .skip(Number(page) * Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= BALANCE =================
export const getBalance = async (req, res) => {
  try {
    let balance = await UserBalance.findOne({ user_id: req.userId });

    if (!balance) {
      balance = new UserBalance({ user_id: req.userId, balance: 0 });
      await balance.save();
    }

    res.json(balance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


function verifyIPN(req) {
  const sig = req.headers["x-nowpayments-sig"];
  if (!sig) return false;

  const expected = crypto
    .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return sig === expected;
}

// ================= IPN CALLBACK (WEBHOOK) - ENHANCED LOGGING =================
export const ipnCallback = async (req, res) => {
  try {
    const data = req.body;
    
    // ✅ Enhanced logging to track webhook calls
    console.log('\n' + '='.repeat(60));
    console.log('🔔 IPN WEBHOOK RECEIVED');
    console.log('='.repeat(60));
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📦 Payload:', JSON.stringify(data, null, 2));
    console.log('🔗 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('='.repeat(60) + '\n');

    if (!verifyIPN(req)) {
      console.error("❌ Invalid IPN signature");
      return res.status(401).json({ error: "Invalid signature" });
    }


    // Validate required fields
    if (!data.payment_id) {
      console.error('❌ Missing payment_id in webhook data');
      return res.status(400).json({ error: 'Missing payment_id' });
    }

    // Find payment in database
    const payment = await Payment.findOne({ payment_id: data.payment_id });
    if (!payment) {
      console.error('❌ Payment not found:', data.payment_id);
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log('✅ Payment found in database:', {
      payment_id: payment.payment_id,
      order_id: payment.order_id,
      current_status: payment.payment_status,
      new_status: data.payment_status
    });

    // Update payment status
    const oldStatus = payment.payment_status;
    payment.payment_status = data.payment_status;
    payment.actually_paid = data.actually_paid || payment.actually_paid;
    payment.updated_at = new Date();

    console.log(`📊 Status transition: ${oldStatus} → ${data.payment_status}`);

    // Handle different payment statuses
    switch (data.payment_status) {
      case 'finished':
        payment.confirmed_at = new Date();
        await updateUserBalance(payment, data);
        console.log('✅ Payment FINISHED - Balance updated');
        break;

      case 'partially_paid':
        console.log('⚠️ Payment PARTIALLY PAID');
        await updateTransactionStatus(data.payment_id, 'partial');
        break;

      case 'failed':
      case 'expired':
        console.log('❌ Payment FAILED/EXPIRED');
        await updateTransactionStatus(data.payment_id, 'failed');
        break;

      case 'refunded':
        console.log('🔄 Payment REFUNDED');
        await handleRefund(payment);
        break;

      case 'waiting':
      case 'confirming':
      case 'sending':
        console.log(`⏳ Payment status: ${data.payment_status}`);
        break;

      default:
        console.log(`ℹ️ Unhandled payment status: ${data.payment_status}`);
    }

    await payment.save();
    console.log('💾 Payment record updated in database\n');

    // ✅ CRITICAL: Always return 200 to acknowledge webhook
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      payment_id: data.payment_id,
      status: data.payment_status
    });

  } catch (err) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ IPN CALLBACK ERROR');
    console.error('='.repeat(60));
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('='.repeat(60) + '\n');
    
    // Still return 200 to prevent NOWPayments from retrying
    res.status(200).json({ 
      success: false, 
      error: 'Internal error but acknowledged',
      message: err.message 
    });
  }
};

// ================= HELPER FUNCTIONS =================

async function updateUserBalance(payment, webhookData) {
  try {
    console.log('💰 Starting balance update...');
    
    const transaction = await Transaction.findOne({
      payment_id: payment.payment_id,
    });

    if (!transaction) {
      console.error('❌ Transaction not found for payment:', payment.payment_id);
      return;
    }

    // Prevent double crediting
    if (transaction.status === 'completed') {
      console.log('⚠️ Transaction already completed, skipping balance update');
      return;
    }

    let userBalance = await UserBalance.findOne({ user_id: payment.user_id });

    if (!userBalance) {
      userBalance = new UserBalance({ 
        user_id: payment.user_id, 
        balance: 0 
      });
      console.log('🆕 Created new balance record');
    }

    let userFunds = await User.findOne({ _id: payment.user_id });
    if (!userFunds) {
      console.log('⚠️ Transaction Failed');
      return;
    }
    transaction.status = 'completed';
    transaction.balance_before = userBalance.balance;
    transaction.completed_at = new Date();

    userFunds.funds += payment.price_amount;
    // Add amount to balance
    userBalance.balance += payment.price_amount;
    transaction.balance_after = userBalance.balance;

    await userBalance.save();
    await transaction.save();
    await userFunds.save();
    console.log('✅ Balance updated successfully:', {
      userId: payment.user_id,
      previousBalance: transaction.balance_before,
      addedAmount: payment.price_amount,
      newBalance: userBalance.balance,
      fundsBalance: userFunds.funds
    });

  } catch (err) {
    console.error('❌ Error updating balance:', err);
    throw err;
  }
}

async function updateTransactionStatus(payment_id, status) {
  try {
    const transaction = await Transaction.findOne({ payment_id });
    if (transaction && transaction.status !== 'completed') {
      transaction.status = status;
      transaction.updated_at = new Date();
      await transaction.save();
      console.log(`✅ Transaction status updated to: ${status}`);
    }
  } catch (err) {
    console.error('❌ Error updating transaction status:', err);
  }
}

async function handleRefund(payment) {
  try {
    console.log('🔄 Processing refund...');
    
    const transaction = await Transaction.findOne({
      payment_id: payment.payment_id,
    });

    if (!transaction || transaction.status !== 'completed') {
      console.log('⚠️ No completed transaction to refund');
      return;
    }

    let userBalance = await UserBalance.findOne({ user_id: payment.user_id });
    
    if (userBalance && userBalance.balance >= payment.price_amount) {
      userBalance.balance -= payment.price_amount;
      await userBalance.save();

      transaction.status = 'refunded';
      transaction.updated_at = new Date();
      await transaction.save();

      console.log('✅ Refund processed:', {
        userId: payment.user_id,
        refundedAmount: payment.price_amount,
        newBalance: userBalance.balance
      });
    } else {
      console.error('❌ Insufficient balance for refund');
    }
  } catch (err) {
    console.error('❌ Error handling refund:', err);
  }
}