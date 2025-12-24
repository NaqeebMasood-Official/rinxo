import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["deposit", "withdraw"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved"],
      default: "pending",
    },
    paymentGateway: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const nicSchema = new mongoose.Schema(
  {
    frontImage: {
      type: String, // store as URL or path
      default: null,
    },
    backImage: {
      type: String, // store as URL or path
      default: null,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["inActive", "active", "pending", "rejected"],
      default: "inActive",
    },

    funds: {
      type: Number,
      default: 0,
      min: 0,
    },

    transactions: {
      type: [transactionSchema],
      default: [],
    },

    nic: {
      type: nicSchema,
      default: {},
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
