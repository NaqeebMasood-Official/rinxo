import mongoose from "mongoose";

// Payment Schema
const paymentSchema = new mongoose.Schema({
  payment_id: { type: String, required: true, unique: true },
  order_id: { type: String, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  price_amount: { type: Number, required: true },
  price_currency: { type: String, required: true },
  pay_amount: { type: Number, required: true },
  pay_currency: { type: String, required: true },
  pay_address: { type: String },
  payment_status: {
    type: String,
    enum: [
      "waiting",
      "confirming",
      "confirmed",
      "sending",
      "partially_paid",
      "finished",
      "failed",
      "refunded",
      "expired",
    ],
    default: "waiting",
  },
  actually_paid: { type: Number, default: 0 },
  invoice_id: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  confirmed_at: { type: Date },
  metadata: { type: Object },
});

const Payment = mongoose.model("Payment", paymentSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  payment_id: { type: String, required: true },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer"],
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  description: { type: String },
  balance_before: { type: Number },
  balance_after: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// User Balance Schema
const userBalanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  updated_at: { type: Date, default: Date.now },
});

const UserBalance = mongoose.model("UserBalance", userBalanceSchema);
 
const withdrawalSchema = new mongoose.Schema(
  {
    withdrawal_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 20,
    },
    currency: {
      type: String,
      default: "USD",
    },
    method: {
      type: String,
      enum: ["bank", "crypto"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    details: {
      type: Object,
      required: true,
      // For bank: { accountName, accountNumber, bankName, routingNumber?, swiftCode? }
      // For crypto: { walletAddress, currency, network, transaction_hash? }
    },
    processing_fee: {
      type: Number,
      default: 0,
    },
    net_amount: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    processed_at: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index for faster queries
withdrawalSchema.index({ user_id: 1, created_at: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ withdrawal_id: 1 });

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;

export { Payment, Transaction, UserBalance, Withdrawal };
