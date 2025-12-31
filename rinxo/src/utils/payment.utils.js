// import axios from "axios"; 

 
// export const paymentAPI = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// /* ================= HELPERS ================= */

// export const normalizeCurrency = (crypto) => {
//   const cryptoUpper = crypto.toUpperCase();

//   const currencyMap = {
//     USDT: "USDTTRC20",
//     USDTERC20: "USDTERC20",
//   };

//   return currencyMap[cryptoUpper] || cryptoUpper;
// };

// /* ================= API CALLS ================= */

// export const fetchCurrencies = async () => {
//   const res = await paymentAPI.get("payment/currencies");
//   return res.data;
// };

// export const getEstimate = async ({ amount, currencyTo }) => {
//   const res = await paymentAPI.post("payment/estimate", {
//     amount,
//     currency_from: "usd",
//     currency_to: currencyTo,
//   });
//   return res.data;
// };

// export const createPayment = async ({ payload, userId }) => {
//   const res = await paymentAPI.post("payment/create-payment", payload, {
//     headers: {
//       "user-id": userId,
//     },
//   });
//   return res.data;
// };


import axios from "axios"; 

export const paymentAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= HELPERS ================= */

export const normalizeCurrency = (crypto) => {
  // Convert to lowercase for consistency
  const cryptoLower = crypto.toLowerCase();

  // Map special cases (NOWPayments specific formats)
  const currencyMap = {
    'usdt': 'usdttrc20',      // Default USDT to TRC20
    'usdterc20': 'usdterc20',  // Explicit ERC20
    'usdttrc20': 'usdttrc20',  // Explicit TRC20
  };

  return currencyMap[cryptoLower] || cryptoLower;
};

/* ================= API CALLS ================= */

export const fetchCurrencies = async () => {
  const res = await paymentAPI.get("/payment/currencies");
  return res.data;
};

export const getEstimate = async ({ amount, currencyTo }) => {
  // Ensure amount is a valid number
  let parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid amount');
  }
  console.log("ParsedAmount:",parsedAmount)
  console.log("CurrencyTo:",currencyTo)
  const estimateBody = {
    amount: parsedAmount,
    currency_from: "usd",
    currency_to: currencyTo
  }
  console.log(estimateBody)
  const res = await paymentAPI.post("/payment/estimate", estimateBody);
  console.log(res)
  return res.data;
};

export const createPayment = async ({ payload, userId }) => {
  // Validate payload before sending
  if (!payload.price_amount || !payload.pay_currency) {
    throw new Error('Invalid payment payload');
  }

  const res = await paymentAPI.post("/payment/create-payment", payload, {
    headers: {
      "user-id": userId,
    },
  });
  return res.data;
};