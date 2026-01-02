import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  const status = searchParams.get("status");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/payment/order/${orderId}`
        // ,
        // {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //   },
        // }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment status");
      }

      const data = await response.json();
      setPaymentData(data);
    } catch (err) {
      console.error("Error fetching payment status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  const handleRetryPayment = () => {
    navigate("/dashboard?section=deposit");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 size={48} className="animate-spin text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Checking Payment Status
          </h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Payment
            </h2>
            <p className="text-gray-600">{error}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={checkPaymentStatus}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
            <button
              onClick={handleReturnToDashboard}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success" || paymentData?.payment?.payment_status === "finished") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600">
              Your deposit has been confirmed and your balance has been updated.
            </p>
          </div>

          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Deposited:</span>
                <span className="font-semibold text-gray-800">
                  ${paymentData.payment.price_amount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-xs text-gray-600">
                  {paymentData.payment.payment_id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-xs text-gray-600">
                  {paymentData.payment.order_id}
                </span>
              </div>
              {paymentData.transaction && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    {paymentData.transaction.status}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleReturnToDashboard}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg transition"
            >
              Return to Dashboard
            </button>
            <button
              onClick={handleRetryPayment}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition"
            >
              Make Another Deposit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled or failed state
  if (status === "cancel" || paymentData?.payment?.payment_status === "failed" || paymentData?.payment?.payment_status === "expired") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {status === "cancel" ? "Payment Cancelled" : "Payment Failed"}
            </h2>
            <p className="text-gray-600">
              {status === "cancel"
                ? "You cancelled the payment. No charges were made."
                : "The payment could not be completed. Please try again."}
            </p>
          </div>

          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-xs text-gray-600">
                  {paymentData.payment.order_id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  {paymentData.payment.payment_status}
                </span>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">What to do next:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your wallet has sufficient funds</li>
                  <li>Ensure you're using the correct network</li>
                  <li>Try a different cryptocurrency</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg transition"
            >
              Try Again
            </button>
            <button
              onClick={handleReturnToDashboard}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending/waiting state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 size={32} className="text-yellow-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Pending
          </h2>
          <p className="text-gray-600">
            Your payment is being processed. This may take a few minutes.
          </p>
        </div>

        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-800">
                ${paymentData.payment.price_amount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-mono text-xs text-gray-600">
                {paymentData.payment.payment_id}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                {paymentData.payment.payment_status}
              </span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Please wait:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your payment is being confirmed on the blockchain</li>
                <li>This process can take 5-30 minutes</li>
                <li>Your balance will update automatically</li>
                <li>You can safely close this page</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={checkPaymentStatus}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh Status
          </button>
          <button
            onClick={handleReturnToDashboard}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}