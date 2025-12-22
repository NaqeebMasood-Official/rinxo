import { Transaction, UserBalance, Withdrawal } from '../models/payment.models';
import mongoose from 'mongoose';

// ================= CREATE WITHDRAWAL =================
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, method, details } = req.body;

    if (!amount || !method || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount < 20) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is $20' });
    }

    const userBalance = await UserBalance.findOne({ user_id: req.userId });

    if (!userBalance || userBalance.balance < withdrawAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const feePercentage = method === 'bank' ? 0.02 : 0.01;
    const processingFee = withdrawAmount * feePercentage;
    const netAmount = withdrawAmount - processingFee;

    const withdrawal_id = `WD-${req.userId}-${Date.now()}`;

    const withdrawal = new Withdrawal({
      withdrawal_id,
      user_id: req.userId,
      amount: withdrawAmount,
      currency: 'USD',
      method,
      status: 'pending',
      details,
      processing_fee: processingFee,
      net_amount: netAmount,
    });

    await withdrawal.save();

    const balanceBefore = userBalance.balance;
    userBalance.balance -= withdrawAmount;
    userBalance.updated_at = new Date();
    await userBalance.save();

    const transaction = new Transaction({
      user_id: req.userId,
      payment_id: withdrawal_id,
      type: 'withdrawal',
      amount: withdrawAmount,
      currency: 'USD',
      status: 'pending',
      description: `${method === 'bank' ? 'Bank' : 'Crypto'} withdrawal`,
      balance_before: balanceBefore,
      balance_after: userBalance.balance,
    });

    await transaction.save();

    res.json({
      success: true,
      withdrawal: {
        withdrawal_id: withdrawal.withdrawal_id,
        amount: withdrawal.amount,
        processing_fee: withdrawal.processing_fee,
        net_amount: withdrawal.net_amount,
        method: withdrawal.method,
        status: withdrawal.status,
        created_at: withdrawal.created_at,
      },
      message: 'Withdrawal request submitted successfully',
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET WITHDRAWALS =================
export const getWithdrawals = async (req, res) => {
  try {
    const { limit = 10, page = 0, status } = req.query;

    const query = { user_id: req.userId };
    if (status) query.status = status;

    const withdrawals = await Withdrawal.find(query)
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .skip(Number(page) * Number(limit));

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET SINGLE WITHDRAWAL =================
export const getWithdrawalById = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;

    const withdrawal = await Withdrawal.findOne({
      withdrawal_id,
      user_id: req.userId,
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE WITHDRAWAL STATUS (ADMIN) =================
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;
    const { status, notes } = req.body;

    if (!['processing', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const withdrawal = await Withdrawal.findOne({ withdrawal_id });
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    const oldStatus = withdrawal.status;
    withdrawal.status = status;
    withdrawal.updated_at = new Date();

    if (notes) withdrawal.notes = notes;
    if (status === 'completed') withdrawal.processed_at = new Date();

    if (
      (status === 'cancelled' || status === 'failed') &&
      oldStatus === 'pending'
    ) {
      const userBalance = await UserBalance.findOne({
        user_id: withdrawal.user_id,
      });

      if (userBalance) {
        userBalance.balance += withdrawal.amount;
        userBalance.updated_at = new Date();
        await userBalance.save();

        await Transaction.updateOne(
          { payment_id: withdrawal_id },
          { status: 'cancelled', updated_at: new Date() }
        );
      }
    }

    if (status === 'completed') {
      await Transaction.updateOne(
        { payment_id: withdrawal_id },
        { status: 'completed', updated_at: new Date() }
      );
    }

    await withdrawal.save();

    res.json({
      success: true,
      withdrawal,
      message: `Withdrawal ${status} successfully`,
    });
  } catch (err) {
    console.error('Update withdrawal error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ================= WITHDRAWAL STATS =================
export const getWithdrawalStats = async (req, res) => {
  try {
    const totalWithdrawals = await Withdrawal.countDocuments({
      user_id: req.userId,
    });

    const pendingWithdrawals = await Withdrawal.countDocuments({
      user_id: req.userId,
      status: 'pending',
    });

    const completedWithdrawals = await Withdrawal.countDocuments({
      user_id: req.userId,
      status: 'completed',
    });

    const totalAmount = await Withdrawal.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(req.userId),
          status: 'completed',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      total_withdrawals: totalWithdrawals,
      pending: pendingWithdrawals,
      completed: completedWithdrawals,
      total_withdrawn: totalAmount[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
