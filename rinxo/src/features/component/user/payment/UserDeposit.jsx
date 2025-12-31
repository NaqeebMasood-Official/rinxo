import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import Button from "../../../../components/common/Button/Button";

import {
  fetchCurrencies,
  getEstimate,
  createPayment,
  normalizeCurrency,
} from "../../../../utils/payment.utils";

export default function UserDeposit({ setActiveSubMenu, user }) {
  const [amount, setAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("eth");
  const [currencies, setCurrencies] = useState([]);
  const [estimatedAmount, setEstimatedAmount] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  /* ================= FETCH CURRENCIES ================= */
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const data = await fetchCurrencies();
        const popularCryptos = ["btc", "eth", "usdt", "ltc", "bnb", "trx"];

        const filtered = data.currencies.filter((c) =>
          popularCryptos.includes(c.toLowerCase())
        );

        setCurrencies(filtered.length ? filtered : popularCryptos);
        console.log("filtered: ", filtered);
      } catch (err) {
        console.error("Error loading currencies:", err);
        setCurrencies(["btc", "eth", "usdt", "ltc"]);
      }
    };

    loadCurrencies();
  }, []);

  /* ================= PRICE ESTIMATION (DEBOUNCE) ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) >= 10) {
        handleEstimate();
      } else {
        setEstimatedAmount(null);
        setError(""); // Clear error when amount changes
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [amount, selectedCrypto]);

  const handleEstimate = async () => {
    setEstimating(true);
    setError(""); // Clear previous errors
    
    try {
      const data = await getEstimate({
        amount: parseFloat(amount),
        currencyTo: normalizeCurrency(selectedCrypto),
      });

      if (!data.estimated_amount) throw new Error("Estimate unavailable");

      setEstimatedAmount(data.estimated_amount);
    } catch (err) {
      console.error("Estimate error:", err);
      setEstimatedAmount(null);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setError("API key validation failed. Please check your NOWPayments API configuration.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to get price estimate. Please try again.");
      }
    } finally {
      setEstimating(false);
    }
  };

  /* ================= CREATE PAYMENT ================= */
  const handleCreatePayment = async () => {
    const parsedAmount = parseFloat(amount);
    
    // Validation checks
    if (!amount || isNaN(parsedAmount)) {
      setError("Please enter a valid amount");
      return;
    }

    if (parsedAmount < 10) {
      setError("Minimum deposit amount is $10");
      return;
    }

    // ✅ CRITICAL: Wait for estimate to complete first
    if (estimating) {
      setError("Please wait for price estimation to complete");
      return;
    }

    if (!estimatedAmount) {
      setError("Please wait for price estimation to complete");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Normalize the currency to match NOWPayments format
      const normalizedCurrency = normalizeCurrency(selectedCrypto);
      
      console.log("Creating payment with:", {
        amount: parsedAmount,
        currency: normalizedCurrency,
        estimatedCryptoAmount: estimatedAmount,
        originalCrypto: selectedCrypto
      });

      const payload = {
        price_amount: parsedAmount,
        price_currency: "usd",
        pay_currency: normalizedCurrency.toLowerCase(),
        order_description: `Wallet deposit of ${parsedAmount}`,
        ipn_callback_url: `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/payment/ipn-callback`,
        success_url: window.location.origin + "/manage-funds?status=success",
        cancel_url: window.location.origin + "/deposit?status=cancelled",
      };

      const data = await createPayment({
        payload,
        userId: user._id,
      });

      setPayment(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create payment";
      setError(errorMsg);
      console.error("Payment creation error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cryptoIcons = {
    btc: "₿",
    eth: "Ξ",
    usdt: "₮",
    ltc: "Ł",
    bnb: "BNB",
    trx: "TRX",
  };

  /* ================= PAYMENT SCREEN ================= */
  if (payment) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <Button
          btnName="Back"
          onClick={() => setActiveSubMenu("undefined")}
          extraCss="mb-4 px-4 py-2 rounded-lg flex items-center gap-2"
          bgColour="bg-gray-100"
          textColour="text-gray-700"
          hoverBgColour="hover:bg-gray-200"
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Complete Your Deposit
            </h2>
            <p className="text-gray-600">
              Send exactly{" "}
              <span className="font-bold text-yellow-600">
                {payment.pay_amount} {payment.pay_currency.toUpperCase()}
              </span>
            </p>
          </div>

          {/* Payment Address */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Payment Address</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border text-sm break-all">
                {payment.pay_address}
              </code>
              <button
                onClick={() => copyToClipboard(payment.pay_address)}
                className="p-2 hover:bg-gray-200 rounded transition"
                title={copied ? "Copied!" : "Copy address"}
              >
                {copied ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount (USD)</span>
              <span className="font-semibold">${payment.price_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pay Amount</span>
              <span className="font-semibold">
                {payment.pay_amount} {payment.pay_currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID</span>
              <span className="text-sm text-gray-500">{payment.payment_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded">
                {payment.payment_status}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Send the exact amount shown above</li>
                <li>Payment expires in 60 minutes</li>
                <li>Funds will be credited after network confirmation</li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          {payment.invoice_id && (
            <button
              onClick={() =>
                window.open(
                  `https://nowpayments.io/payment/?iid=${payment.invoice_id}`,
                  "_blank"
                )
              }
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              Open Payment Page <ExternalLink size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ================= MAIN FORM ================= */
  return (
    <div className="p-4 sm:p-6 max-w-1xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <Button
          btnName="Back"
          onClick={() => setActiveSubMenu("undefined")}
          extraCss="mb-4 px-4 py-2 rounded-lg flex items-center gap-2"
          bgColour="bg-gray-100"
          textColour="text-gray-700"
          hoverBgColour="hover:bg-gray-200"
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Deposit Funds using Crypto
          </h2>
          <p className="text-gray-600">
            Add money to your wallet using cryptocurrency
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deposit Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg"
              min="10"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum deposit: $10</p>
          <p className="text-xs text-gray-500 mt-1">Minimum deposit BTC: $24</p>
        </div>

        {/* Cryptocurrency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Cryptocurrency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currencies.map((crypto) => (
              <button
                key={crypto}
                onClick={() => setSelectedCrypto(crypto)}
                className={`p-4 rounded-lg border-2 transition  disabled:bg-gray-300 disabled:cursor-not-allowed ${
                  selectedCrypto === crypto
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={crypto === "btc" && amount < 24 }
              >
                <div className="text-2xl mb-1">{cryptoIcons[crypto] || "💰"}</div>
                <p className="font-semibold text-gray-800 uppercase">{crypto}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Amount */}
        {amount && parseFloat(amount) >= 10 && (
          <div className="bg-gray-50 rounded-lg p-4">
            {estimating ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 size={20} className="animate-spin" />
                <p className="text-sm">Calculating crypto amount...</p>
              </div>
            ) : estimatedAmount ? (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  You will pay approximately:
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {estimatedAmount} {selectedCrypto.toUpperCase()}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Waiting for price estimate...
              </p>
            )}
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value.toString())}
                className="py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700"
              >
                ${value}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCreatePayment}
          disabled={loading || estimating || !amount || parseFloat(amount) < 10 || !estimatedAmount || (selectedCrypto === "btc" && amount < 24)}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Creating Payment...
            </>
          ) : estimating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Calculating...
            </>
          ) : !estimatedAmount && amount && parseFloat(amount) >= 10 ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Getting Price...
            </>
          ) : (
            <>
              <Wallet size={20} />
              Continue to Payment
            </>
          )}
        </button>

        {/* Helper text for disabled button */}
        {!estimatedAmount && amount && parseFloat(amount) >= 10 && (
          <p className="text-xs text-center text-gray-500 -mt-3">
            Please wait for price calculation to complete
          </p>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle
              size={20}
              className="text-blue-600 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter the amount you want to deposit</li>
                <li>Select your preferred cryptocurrency</li>
                <li>Send crypto to the provided address</li>
                <li>Funds will be credited after confirmation</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}