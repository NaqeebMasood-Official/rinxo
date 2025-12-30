import axios from "axios"; 

 
export const paymentAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= HELPERS ================= */

export const normalizeCurrency = (crypto) => {
  const cryptoUpper = crypto.toUpperCase();

  const currencyMap = {
    USDT: "USDTTRC20",
    USDTERC20: "USDTERC20",
  };

  return currencyMap[cryptoUpper] || cryptoUpper;
};

/* ================= API CALLS ================= */

export const fetchCurrencies = async () => {
  const res = await paymentAPI.get("payment/currencies");
  return res.data;
};

export const getEstimate = async ({ amount, currencyTo }) => {
  const res = await paymentAPI.post("payment/estimate", {
    amount,
    currency_from: "usd",
    currency_to: currencyTo,
  });
  return res.data;
};

export const createPayment = async ({ payload, userId }) => {
  const res = await paymentAPI.post("payment/create-payment", payload, {
    headers: {
      "user-id": userId,
    },
  });
  return res.data;
};
