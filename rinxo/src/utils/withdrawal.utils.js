import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const withdrawalAPI = axios.create({
  baseURL: `${API_URL}/withdrawal`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= CREATE WITHDRAWAL =================
export const createWithdrawal = async ({ amount, method, details, userId }) => {
  const response = await withdrawalAPI.post("/create", {
    amount,
    method,
    details
  }, {
    headers: {
      "user-id": userId,
    },
  });
  return response.data;
};

// ================= GET USER WITHDRAWALS =================
export const getUserWithdrawals = async ({ userId, limit = 10, page = 0, status }) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await withdrawalAPI.get(`/my-withdrawals?${params}`, {
    headers: {
      "user-id": userId,
    },
  });
  return response.data;
};

// ================= GET WITHDRAWAL BY ID =================
export const getWithdrawalById = async ({ withdrawalId, userId }) => {
  const response = await withdrawalAPI.get(`/${withdrawalId}`, {
    headers: {
      "user-id": userId,
    },
  });
  return response.data;
};

// ================= CANCEL WITHDRAWAL =================
export const cancelWithdrawal = async ({ withdrawalId, userId }) => {
  const response = await withdrawalAPI.post(`/${withdrawalId}/cancel`, {}, {
    headers: {
      "user-id": userId,
    },
  });
  return response.data;
};

// ================= GET WITHDRAWAL STATS =================
export const getWithdrawalStats = async ({ userId }) => {
  const response = await withdrawalAPI.get("/stats/summary", {
    headers: {
      "user-id": userId,
    },
  });
  return response.data;
};

// ================= HELPER FUNCTIONS =================

// Calculate withdrawal fee
export const calculateFee = (amount, method) => {
  const feePercentage = method === 'crypto' ? 0.02 : 0.01; // 2% crypto, 1% bank
  return amount * feePercentage;
};

// Calculate net amount after fee
export const calculateNetAmount = (amount, method) => {
  return amount - calculateFee(amount, method);
};

// Validate wallet address (basic validation)
export const validateWalletAddress = (address, currency) => {
  if (!address || address.length < 26 || address.length > 62) {
    return false;
  }
  
  // Currency-specific validation patterns
  const patterns = {
    btc: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    eth: /^0x[a-fA-F0-9]{40}$/,
    ltc: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
    trx: /^T[a-zA-Z0-9]{33}$/,
  };
  
  const pattern = patterns[currency?.toLowerCase()];
  return pattern ? pattern.test(address) : true; // If no pattern, allow it
};

// Format withdrawal status for display
export const formatWithdrawalStatus = (status) => {
  const statusMap = {
    pending: { text: 'Pending', color: 'yellow', icon: '⏳' },
    processing: { text: 'Processing', color: 'blue', icon: '⚙️' },
    completed: { text: 'Completed', color: 'green', icon: '✅' },
    failed: { text: 'Failed', color: 'red', icon: '❌' },
    cancelled: { text: 'Cancelled', color: 'gray', icon: '🚫' },
  };
  
  return statusMap[status] || { text: status, color: 'gray', icon: '❓' };
};

// Format currency for display
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Get processing time estimate
export const getProcessingTimeEstimate = (method) => {
  return method === 'bank' ? '3-5 business days' : '24-48 hours';
};