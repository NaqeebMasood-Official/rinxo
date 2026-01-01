import {
  Withdrawal,
  UserBalance,
  Transaction 
} from "../models/payment.models.js";
import crypto from "crypto";
import User from "../models/User.model.js";

// ================= CREATE WITHDRAWAL REQUEST =================
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, method, details } = req.body;
    const userId = req.userId;

    // Validate input
    if (!amount || !method || !details) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["amount", "method", "details"],
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 20) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Minimum withdrawal is $20",
      });
    }

    // Check user balance
    const userBalance = await UserBalance.findOne({ user_id: userId });
    if (!userBalance || userBalance.balance < parsedAmount) {
      return res.status(400).json({
        error: "Insufficient balance",
        available: userBalance?.balance || 0,
      });
    }

    // Validate withdrawal details based on method
    if (method === "bank") {
      const { accountName, accountNumber, bankName } = details;
      if (!accountName || !accountNumber || !bankName) {
        return res.status(400).json({
          error: "Incomplete bank details",
          required: ["accountName", "accountNumber", "bankName"],
        });
      }
    } else if (method === "crypto") {
      const { walletAddress, currency, network } = details;
      if (!walletAddress || !currency || !network) {
        return res.status(400).json({
          error: "Incomplete crypto details",
          required: ["walletAddress", "currency", "network"],
        });
      }

      // Validate wallet address format (basic validation)
      if (walletAddress.length < 26 || walletAddress.length > 62) {
        return res.status(400).json({
          error: "Invalid wallet address format",
        });
      }
    } else {
      return res.status(400).json({
        error: "Invalid withdrawal method",
        allowed: ["bank", "crypto"],
      });
    }

    // Calculate processing fee (example: 2% for crypto, 1% for bank)
    const feePercentage = method === "crypto" ? 0.02 : 0.01;
    const processingFee = parsedAmount * feePercentage;
    const netAmount = parsedAmount - processingFee;

    // Generate unique withdrawal ID
    const withdrawal_id = `WD-${userId.toString().slice(-6)}-${Date.now()}`;

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      withdrawal_id,
      user_id: userId,
      amount: parsedAmount,
      currency: "USD",
      method,
      status: "pending",
      details,
      processing_fee: processingFee,
      net_amount: netAmount,
    });

    await withdrawal.save();

    // Deduct amount from user balance (hold it)
    const balanceBefore = userBalance.balance;
    userBalance.balance -= parsedAmount;
    userBalance.updated_at = new Date();
    await userBalance.save();

    // Update User funds
    const user = await User.findById(userId);
    if (user) {
      user.funds -= parsedAmount;
      await user.save();
    }

    // Create transaction record
    const transaction = new Transaction({
      user_id: userId,
      payment_id: withdrawal_id,
      type: "withdrawal",
      amount: parsedAmount,
      currency: "USD",
      status: "pending",
      description: `${method} withdrawal - ${netAmount.toFixed(
        2
      )} after ${processingFee.toFixed(2)} fee`,
      balance_before: balanceBefore,
      balance_after: userBalance.balance,
    });

    await transaction.save();

    console.log("✅ Withdrawal request created:", {
      withdrawal_id,
      userId,
      amount: parsedAmount,
      method,
      netAmount,
    });

    res.json({
      success: true,
      withdrawal_id,
      amount: parsedAmount,
      processing_fee: processingFee,
      net_amount: netAmount,
      status: "pending",
      message: "Withdrawal request submitted successfully",
      estimated_processing_time:
        method === "bank" ? "3-5 business days" : "24-48 hours",
    });
  } catch (err) {
    console.error("❌ Withdrawal creation error:", err);
    res.status(500).json({
      error: "Failed to create withdrawal",
      message: err.message,
    });
  }
};

// ================= GET USER WITHDRAWALS =================
export const getUserWithdrawals = async (req, res) => {
  try {
    const { limit = 10, page = 0, status } = req.query;
    const userId = req.userId;

    const query = { user_id: userId };
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

// ================= GET WITHDRAWAL BY ID =================
export const getWithdrawalById = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;
    const userId = req.userId;

    const withdrawal = await Withdrawal.findOne({
      withdrawal_id,
      user_id: userId,
    });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CANCEL WITHDRAWAL (Only if pending) =================
export const cancelWithdrawal = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;
    const userId = req.userId;

    const withdrawal = await Withdrawal.findOne({
      withdrawal_id,
      user_id: userId,
    });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        error: "Cannot cancel withdrawal",
        message: `Withdrawal is already ${withdrawal.status}`,
      });
    }

    // Refund amount to user balance
    const userBalance = await UserBalance.findOne({ user_id: userId });
    if (userBalance) {
      userBalance.balance += withdrawal.amount;
      userBalance.updated_at = new Date();
      await userBalance.save();
    }

    // Refund User funds
    const user = await User.findById(userId);
    if (user) {
      user.funds += withdrawal.amount;
      await user.save();
    }

    // Update withdrawal status
    withdrawal.status = "cancelled";
    withdrawal.updated_at = new Date();
    withdrawal.notes = "Cancelled by user";
    await withdrawal.save();

    // Update transaction status
    await Transaction.updateOne(
      { payment_id: withdrawal_id },
      {
        status: "cancelled",
        updated_at: new Date(),
      }
    );

    console.log("✅ Withdrawal cancelled:", withdrawal_id);

    res.json({
      success: true,
      message: "Withdrawal cancelled and balance refunded",
      refunded_amount: withdrawal.amount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= ADMIN: PROCESS WITHDRAWAL =================
// This would typically be called by an admin or automated system
export const processWithdrawal = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;
    const { status, transaction_hash, notes } = req.body;

    if (!["completed", "failed"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        allowed: ["completed", "failed"],
      });
    }

    const withdrawal = await Withdrawal.findOne({ withdrawal_id });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (
      withdrawal.status === "completed" ||
      withdrawal.status === "cancelled"
    ) {
      return res.status(400).json({
        error: "Withdrawal already processed",
        current_status: withdrawal.status,
      });
    }

    // If failed, refund the amount
    if (status === "failed") {
      const userBalance = await UserBalance.findOne({
        user_id: withdrawal.user_id,
      });
      if (userBalance) {
        userBalance.balance += withdrawal.amount;
        userBalance.updated_at = new Date();
        await userBalance.save();
      }

      // Refund User funds
      const user = await User.findById(withdrawal.user_id);
      if (user) {
        user.funds += withdrawal.amount;
        await user.save();
      }
    }

    // Update withdrawal
    withdrawal.status = status;
    withdrawal.processed_at = new Date();
    withdrawal.updated_at = new Date();
    if (notes) withdrawal.notes = notes;
    if (transaction_hash)
      withdrawal.details.transaction_hash = transaction_hash;
    await withdrawal.save();

    // Update transaction
    await Transaction.updateOne(
      { payment_id: withdrawal_id },
      {
        status: status === "completed" ? "completed" : "failed",
        updated_at: new Date(),
      }
    );

    console.log(`✅ Withdrawal ${status}:`, withdrawal_id);

    res.json({
      success: true,
      withdrawal_id,
      status,
      message: `Withdrawal ${status} successfully`,
    });
  } catch (err) {
    console.error("❌ Process withdrawal error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET WITHDRAWAL STATS =================
export const getWithdrawalStats = async (req, res) => {
  try {
    const userId = req.userId;

    const stats = await Withdrawal.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total_amount: { $sum: "$amount" },
        },
      },
    ]);

    const totalWithdrawals = await Withdrawal.countDocuments({
      user_id: userId,
    });
    const totalAmount = await Withdrawal.aggregate([
      { $match: { user_id: userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      total_withdrawals: totalWithdrawals,
      total_withdrawn: totalAmount[0]?.total || 0,
      by_status: stats.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          total_amount: item.total_amount,
        };
        return acc;
      }, {}),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
