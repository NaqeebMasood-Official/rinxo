import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Landmark, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Shield,
  Info,
  DollarSign
} from "lucide-react";
import Button from "../../../../components/common/Button/Button";
import axios from "axios";

export default function UserWithdraw({ setActiveSubMenu, user }) {
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [withdrawalData, setWithdrawalData] = useState(null);
  
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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/payment/balance`, {
        headers: { 'user-id': user._id }
      }); 
      setBalance(response.data.balance);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Failed to load balance");
    }
  };

  const handleBankInputChange = (e) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error on input change
  };

  const handleCryptoInputChange = (e) => {
    setCryptoDetails({
      ...cryptoDetails,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error on input change
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
      setError(`Insufficient balance. Available: $${balance.toFixed(2)}`);
      return false;
    }

    if (withdrawMethod === "bank") {
      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
        setError("Please fill in all required bank details");
        return false;
      }
      
      // Validate account number (basic)
      if (bankDetails.accountNumber.length < 8) {
        setError("Invalid account number");
        return false;
      }
    } else {
      if (!cryptoDetails.walletAddress) {
        setError("Please enter your wallet address");
        return false;
      }
      
      // Basic wallet address validation
      if (cryptoDetails.walletAddress.length < 26 || cryptoDetails.walletAddress.length > 62) {
        setError("Invalid wallet address format");
        return false;
      }
    }

    return true;
  };

  const calculateFee = () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount)) return 0;
    
    const feePercentage = withdrawMethod === "crypto" ? 0.02 : 0.01; // 2% crypto, 1% bank
    return (withdrawAmount * feePercentage).toFixed(2);
  };

  const calculateNetAmount = () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount)) return 0;
    
    return (withdrawAmount - parseFloat(calculateFee())).toFixed(2);
  };

  const handleWithdraw = async () => {
    if (!validateWithdrawal()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const withdrawalPayload = {
        amount: parseFloat(amount),
        method: withdrawMethod,
        details: withdrawMethod === "bank" ? bankDetails : cryptoDetails
      };

      console.log('📤 Submitting withdrawal:', withdrawalPayload);

      const response = await axios.post(
        `${API_URL}/withdrawal/create`,
        withdrawalPayload,
        {
          headers: { 'user-id': user._id }
        }
      );

      console.log('✅ Withdrawal created:', response.data);
      
      setWithdrawalData(response.data);
      setSuccess(true);
      
      // Reset form
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

    } catch (err) {
      console.error('❌ Withdrawal error:', err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      "Failed to process withdrawal";
      setError(errorMsg);
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

  // Success Screen
  if (success && withdrawalData) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Withdrawal Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your withdrawal request has been received and is being processed.
            </p>

            {/* Withdrawal Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Withdrawal ID</span>
                <span className="font-mono text-sm text-gray-800">
                  {withdrawalData.withdrawal_id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Requested</span>
                <span className="font-semibold text-gray-800">
                  ${withdrawalData.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Fee</span>
                <span className="text-red-600">
                  -${withdrawalData.processing_fee.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-gray-800 font-semibold">You'll Receive</span>
                <span className="text-xl font-bold text-green-600">
                  ${withdrawalData.net_amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Processing Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 text-left">
                  <p className="font-semibold mb-2">Processing Time:</p>
                  <p>{withdrawalData.estimated_processing_time}</p>
                  <p className="mt-2 text-xs">
                    You will be notified once your withdrawal is processed.
                  </p>
                </div>
              </div>
            </div>

            <Button
              btnName="Back to Wallet"
              onClick={() => {
                setSuccess(false);
                setActiveSubMenu("undefined");
              }}
              extraCss="px-6 py-3 rounded-lg w-full"
              bgColour="bg-yellow-400"
              textColour="text-white"
              hoverBgColour="hover:bg-yellow-500"
              fontTextStyle="font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // Main Withdrawal Form
  return (
    <div className="p-4 sm:p-6 mx-auto max-w-2xl">
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Withdraw Funds</h2>
          <p className="text-gray-600">Transfer money from your wallet</p>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-gray-800">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
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
              <p className="text-xs text-green-600 mt-1">1% fee</p>
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
              <p className="text-xs text-green-600 mt-1">2% fee</p>
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
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg"
              min="20"
              max={balance}
              step="0.01"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Minimum: $20</span>
            <span>Maximum: ${balance.toFixed(2)}</span>
          </div>
          
          {/* Fee Breakdown */}
          {amount && parseFloat(amount) >= 20 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Withdrawal Amount:</span>
                <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee ({withdrawMethod === 'crypto' ? '2%' : '1%'}):</span>
                <span className="text-red-600">-${calculateFee()}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <span className="text-gray-800">You'll Receive:</span>
                <span className="text-green-600">${calculateNetAmount()}</span>
              </div>
            </div>
          )}
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
                className="py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
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
                Account Holder Name *
              </label>
              <input
                type="text"
                name="accountName"
                value={bankDetails.accountName}
                onChange={handleBankInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleBankInputChange}
                placeholder="1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleBankInputChange}
                placeholder="Bank of America"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                required
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
                  SWIFT Code
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
                Wallet Address *
              </label>
              <input
                type="text"
                name="walletAddress"
                value={cryptoDetails.walletAddress}
                onChange={handleCryptoInputChange}
                placeholder="Enter your wallet address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent font-mono text-sm"
                required
              />
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                Double-check your address. Crypto transactions cannot be reversed.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleWithdraw}
          disabled={loading || !amount || parseFloat(amount) < 20 || parseFloat(amount) > balance}
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
                <li>Ensure all details are correct before submitting</li>
                <li>Withdrawal requests cannot be modified after submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}