import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Copy,
  ExternalLink 
} from "lucide-react";
import Button from "../../../../components/common/Button/Button";
import axios from "axios";

export default function UserDeposit({setActiveSubMenu}) {
  const [amount, setAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [currencies, setCurrencies] = useState([]);
  const [estimatedAmount, setEstimatedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const API_URL = "http://localhost:8000/api/payment/payments";

  // Fetch available cryptocurrencies
  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Get price estimation when amount or crypto changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      getEstimate();
    }
  }, [amount, selectedCrypto]);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(`${API_URL}/currencies`);
      const popularCryptos = ["btc", "eth", "usdt", "ltc", "bnb", "trx"];
      const filtered = response.data.currencies.filter(c => 
        popularCryptos.includes(c.toLowerCase())
      );
      setCurrencies(filtered);
    } catch (err) {
      console.error("Error fetching currencies:", err);
      setCurrencies(["btc", "eth", "usdt", "ltc"]);
    }
  };

  const getEstimate = async () => {
    try {
      const response = await axios.post(`${API_URL}/estimate`, {
        amount: parseFloat(amount),
        currency_from: "usd",
        currency_to: selectedCrypto
      });
      setEstimatedAmount(response.data.estimated_amount);
    } catch (err) {
      console.error("Error getting estimate:", err);
    }
  };

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) < 10) {
      setError("Minimum deposit amount is $10");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/create-payment`, {
        price_amount: parseFloat(amount),
        price_currency: "usd",
        pay_currency: selectedCrypto,
        order_id: `DEP-${Date.now()}`,
        order_description: `Wallet deposit of $${amount}`,
        ipn_callback_url: `${API_URL}/ipn-callback`,
        success_url: window.location.origin + "/manage-funds?status=success",
        cancel_url: window.location.origin + "/deposit?status=cancelled"
      });

      setPayment(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

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
    trx: "TRX"
  };

  if (payment) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <Button
          btnName="Back"
          onClick={()=>setActiveSubMenu("undefined")}
          extraCss="mb-4 px-4 py-2 rounded-lg flex items-center gap-2"
          bgColour="bg-gray-100"
          textColour="text-gray-700"
          hoverBgColour="hover:bg-gray-200 transition"
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
              Send exactly <span className="font-bold text-yellow-600">
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
              >
                {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} />}
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
          <button
            onClick={() => window.open(`https://nowpayments.io/payment/?iid=${payment.invoice_id}`, '_blank')}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            Open Payment Page <ExternalLink size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-1xl mx-auto">
      

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <Button
            btnName="Back"
            onClick={()=>setActiveSubMenu("undefined")}
            extraCss="mb-4 px-4 py-2 rounded-lg flex items-center gap-2"
            bgColour="bg-gray-100"
            textColour="text-gray-700"
            hoverBgColour="hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />
        </Button>
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Deposit Funds using Crypto</h2>
          <p className="text-gray-600">Add money to your wallet using cryptocurrency</p>
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
                className={`p-4 rounded-lg border-2 transition ${
                  selectedCrypto === crypto
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{cryptoIcons[crypto] || "💰"}</div>
                <p className="font-semibold text-gray-800 uppercase">{crypto}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Amount */}
        {estimatedAmount && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">You will receive approximately:</p>
            <p className="text-2xl font-bold text-gray-800">
              {estimatedAmount} {selectedCrypto.toUpperCase()}
            </p>
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
          disabled={loading || !amount || parseFloat(amount) < 10}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Creating Payment...
            </>
          ) : (
            <>
              <Wallet size={20} />
              Continue to Payment
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
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