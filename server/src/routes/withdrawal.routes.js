import express from 'express';
import {
  createWithdrawal,
  getWithdrawals,
  getWithdrawalById,
  updateWithdrawalStatus,
  getWithdrawalStats,
} from '../controllers/withdrawal.controller.js';

const withdrawRoute = express.Router();

// Auth middleware
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.user_id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

withdrawRoute.post('/withdraw', authenticateUser, createWithdrawal);
withdrawRoute.get('/withdrawals', authenticateUser, getWithdrawals);
withdrawRoute.get('/withdrawal/:withdrawal_id', authenticateUser, getWithdrawalById);
withdrawRoute.patch(
  '/withdrawal/:withdrawal_id/status',
  authenticateUser,
  updateWithdrawalStatus
);
withdrawRoute.get('/withdrawal-stats', authenticateUser, getWithdrawalStats);

export default withdrawRoute;
