import express from "express";
import {
  createWithdrawal,
  getUserWithdrawals,
  getWithdrawalById,
  cancelWithdrawal,
  processWithdrawal,
  getWithdrawalStats,
} from "../controllers/withdrawal.controller.js";
// import { protect } from "../middlewares/auth.middlerware.js";

const withdrawalRoute = express.Router();

// ================= AUTH MIDDLEWARE =================
// const authenticateUser = (req, res, next) => {
//   const userId = req.headers["user-id"] || req.body.userId;

//   if (!userId) {
//     return res.status(401).json({
//       error: "Unauthorized",
//       message: "User ID is required in headers or body",
//     });
//   }

//   req.userId = userId;
//   next();
// };

// ================= ADMIN MIDDLEWARE (Optional) =================
// const authenticateAdmin = (req, res, next) => {
//   const adminKey = req.headers["admin-key"];

//   if (adminKey !== process.env.ADMIN_SECRET_KEY) {
//     return res.status(403).json({
//       error: "Forbidden",
//       message: "Admin access required",
//     });
//   }

//   next();
// };

// ================= USER ROUTES =================

// Create withdrawal request
withdrawalRoute.post(
  "/create",
  // authenticateUser,
  createWithdrawal
);

// Get user's withdrawals
withdrawalRoute.get(
  "/my-withdrawals/:userId",
  // protect,
  // authenticateUser,
  getUserWithdrawals
);

// Get specific withdrawal
withdrawalRoute.get(
  "/:withdrawal_id",
  // authenticateUser,
  getWithdrawalById
);

// Cancel pending withdrawal
withdrawalRoute.post(
  "/:withdrawal_id/cancel",
  // authenticateUser,
  cancelWithdrawal
);

// Get withdrawal statistics
withdrawalRoute.get(
  "/stats/summary",
  // authenticateUser,
  getWithdrawalStats
);

// ================= ADMIN ROUTES =================

// Process withdrawal (mark as completed or failed)
withdrawalRoute.post(
  "/:withdrawal_id/process",
  // authenticateAdmin,
  processWithdrawal
);

export default withdrawalRoute;
