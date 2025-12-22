import { Payment, Transaction, UserBalance } from '../models/payment.models';
import axios from 'axios';

// NOWPayments API configuration
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

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

// ================= MIN AMOUNT =================
export const getMinAmount = async (req, res) => {
  try {
    const { currency } = req.params;
    const response = await nowpaymentsRequest.get(
      `/min-amount?currency_from=${currency}&currency_to=${currency}`
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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await nowpaymentsRequest.post('/estimate', {
      amount,
      currency_from,
      currency_to,
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      ipn_callback_url,
      success_url,
      cancel_url,
    } = req.body;

    if (!price_amount || !price_currency || !pay_currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order_id = `DEP-${req.userId}-${Date.now()}`;

    const response = await nowpaymentsRequest.post('/payment', {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description: order_description || 'Wallet deposit',
      ipn_callback_url,
      success_url,
      cancel_url,
    });

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
      metadata: { success_url, cancel_url },
    });

    await payment.save();

    const transaction = new Transaction({
      user_id: req.userId,
      payment_id: response.data.payment_id,
      type: 'deposit',
      amount: price_amount,
      currency: price_currency,
      status: 'pending',
      description: order_description || 'Crypto deposit',
    });

    await transaction.save();

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      details: err.response?.data,
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

// ================= IPN CALLBACK =================
export const ipnCallback = async (req, res) => {
  try {
    const data = req.body;

    const payment = await Payment.findOne({ payment_id: data.payment_id });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.payment_status = data.payment_status;
    payment.actually_paid = data.actually_paid || payment.actually_paid;
    payment.updated_at = new Date();

    if (data.payment_status === 'finished') {
      payment.confirmed_at = new Date();
    }

    await payment.save();

    const transaction = await Transaction.findOne({
      payment_id: data.payment_id,
    });

    if (transaction && data.payment_status === 'finished') {
      let userBalance = await UserBalance.findOne({ user_id: payment.user_id });

      if (!userBalance) {
        userBalance = new UserBalance({ user_id: payment.user_id, balance: 0 });
      }

      transaction.status = 'completed';
      transaction.balance_before = userBalance.balance;

      userBalance.balance += payment.price_amount;
      transaction.balance_after = userBalance.balance;

      await userBalance.save();
      await transaction.save();
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
