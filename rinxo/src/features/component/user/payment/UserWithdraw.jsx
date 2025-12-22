import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Landmark, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Shield,
  Info
} from "lucide-react";
import Button from "../../../../components/common/Button/Button";
import axios from "axios";

export default function UserWithdraw({ setActiveSubMenu }) {
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Bank Details
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
    swiftCode: ""
  });

  // Crypto Details
  const [cryptoDetails, setCryptoDetails] = useState({
    walletAddress: "",
    currency: "btc",
    network: "BTC"
  });

  const API_URL = "http://localhost:3000/api/payments";

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/balance`, {
        headers: { 'user-id': 'USER123' } // Replace with actual user ID
      });
      setBalance(response.data.balance);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const handleBankInputChange = (e) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleCryptoInputChange = (e) => {
    setCryptoDetails({
      ...cryptoDetails,
      [e.target.name]: e.target.value
    });
  };

  const validateWithdrawal = () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (withdrawAmount < 20) {
      setError("Minimum withdrawal amount is $20");
      return false;
    }

    if (withdrawAmount > balance) {
      setError("Insufficient balance");
      return false;
    }

    if (withdrawMethod === "bank") {
      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
        setError("Please fill in all bank details");
        return false;
      }
    } else {
      if (!cryptoDetails.walletAddress) {
        setError("Please enter your wallet address");
        return false;
      }
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateWithdrawal()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const withdrawalData = {
        amount: parseFloat(amount),
        method: withdrawMethod,
        details: withdrawMethod === "bank" ? bankDetails : cryptoDetails
      };

      const response = await axios.post(
        `${API_URL}/withdraw`,
        withdrawalData,
        {
          headers: { 'user-id': 'USER123' } // Replace with actual user ID
        }
      );

      setSuccess(true);
      setAmount("");
      setBankDetails({
        accountName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        swiftCode: ""
      });
      setCryptoDetails({
        walletAddress: "",
        currency: "btc",
        network: "BTC"
      });
      
      // Refresh balance
      fetchBalance();

      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        setActiveSubMenu("undefined");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to process withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const cryptoNetworks = {
    btc: ["BTC"],
    eth: ["ERC20", "BEP20"],
    usdt: ["TRC20", "ERC20", "BEP20"],
    ltc: ["LTC"],
    bnb: ["BEP20"],
    trx: ["TRC20"]
  };

  if (success) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Withdrawal Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your withdrawal request of <span className="font-bold">${amount}</span> has been submitted.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 text-left">
                  <p className="font-semibold mb-1">Processing Time:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bank Transfer: 3-5 business days</li>
                    <li>Crypto Transfer: 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              btnName="Back to Wallet"
              onClick={() => setActiveSubMenu("undefined")}
              extraCss="px-6 py-3 rounded-lg"
              bgColour="bg-yellow-400"
              textColour="text-white"
              hoverBgColour="hover:bg-yellow-500 transition"
              fontTextStyle="font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6   mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <Button
          btnName="Back"
          onClick={() => setActiveSubMenu("undefined")}
          extraCss="mb-4 px-4 py-2 rounded-lg flex items-center gap-2"
          bgColour="bg-gray-100"
          textColour="text-gray-700"
          hoverBgColour="hover:bg-gray-200 transition"
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Landmark size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Withdraw Funds</h2>
          <p className="text-gray-600">Transfer money from your wallet</p>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-gray-800">${balance.toLocaleString()}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Withdrawal Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Withdrawal Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWithdrawMethod("bank")}
              className={`p-4 rounded-lg border-2 transition ${
                withdrawMethod === "bank"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Landmark size={24} className="mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Bank Transfer</p>
              <p className="text-xs text-gray-500 mt-1">3-5 business days</p>
            </button>

            <button
              onClick={() => setWithdrawMethod("crypto")}
              className={`p-4 rounded-lg border-2 transition ${
                withdrawMethod === "crypto"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Shield size={24} className="mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Cryptocurrency</p>
              <p className="text-xs text-gray-500 mt-1">24-48 hours</p>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount (USD)
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
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg"
              min="20"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: $20</p>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value.toString())}
                disabled={value > balance}
                className="py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${value}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Transfer Details */}
        {withdrawMethod === "bank" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Landmark size={18} />
              Bank Account Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountName"
                value={bankDetails.accountName}
                onChange={handleBankInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleBankInputChange}
                placeholder="1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleBankInputChange}
                placeholder="Bank of America"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  name="routingNumber"
                  value={bankDetails.routingNumber}
                  onChange={handleBankInputChange}
                  placeholder="021000021"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT Code (Optional)
                </label>
                <input
                  type="text"
                  name="swiftCode"
                  value={bankDetails.swiftCode}
                  onChange={handleBankInputChange}
                  placeholder="BOFAUS3N"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Crypto Transfer Details */}
        {withdrawMethod === "crypto" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Shield size={18} />
              Cryptocurrency Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Cryptocurrency
              </label>
              <select
                name="currency"
                value={cryptoDetails.currency}
                onChange={handleCryptoInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              >
                <option value="btc">Bitcoin (BTC)</option>
                <option value="eth">Ethereum (ETH)</option>
                <option value="usdt">Tether (USDT)</option>
                <option value="ltc">Litecoin (LTC)</option>
                <option value="bnb">Binance Coin (BNB)</option>
                <option value="trx">Tron (TRX)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network
              </label>
              <select
                name="network"
                value={cryptoDetails.network}
                onChange={handleCryptoInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              >
                {cryptoNetworks[cryptoDetails.currency]?.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                name="walletAddress"
                value={cryptoDetails.walletAddress}
                onChange={handleCryptoInputChange}
                placeholder="Enter your wallet address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Double-check your address. Transactions cannot be reversed.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleWithdraw}
          disabled={loading || !amount || parseFloat(amount) < 20}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Landmark size={20} />
              Submit Withdrawal Request
            </>
          )}
        </button>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All withdrawals are subject to verification</li>
                <li>Processing times may vary based on your bank or network</li>
                <li>A small processing fee may apply</li>
                <li>Ensure all details are correct before submitting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}