import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Filter,
  Download
} from "lucide-react";
import Button from "../../../../components/common/Button/Button"; 
import { cancelWithdrawal, getUserWithdrawals } from "../../../../utils/withdrawal.utils";

export default function WithdrawalHistory({ setActiveSubMenu, user }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadWithdrawals();
  }, [filter, page]);

  const loadWithdrawals = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = {
        userId: user._id,
        limit: 10,
        page,
      };
      
      if (filter !== "all") {
        params.status = filter;
      }

      const data = await getUserWithdrawals(params);
      setWithdrawals(data.withdrawals);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error loading withdrawals:", err);
      setError("Failed to load withdrawal history");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId) => {
    if (!confirm("Are you sure you want to cancel this withdrawal? The amount will be refunded to your balance.")) {
      return;
    }

    setCancellingId(withdrawalId);
    
    try {
      await cancelWithdrawal({
        withdrawalId,
        userId: user._id,
      });
      
      // Reload withdrawals
      loadWithdrawals();
      alert("Withdrawal cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling withdrawal:", err);
      alert(err.response?.data?.error || "Failed to cancel withdrawal");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={20} className="text-yellow-600" />;
      case "processing":
        return <Loader2 size={20} className="text-blue-600 animate-spin" />;
      case "completed":
        return <CheckCircle size={20} className="text-green-600" />;
      case "failed":
        return <XCircle size={20} className="text-red-600" />;
      case "cancelled":
        return <AlertCircle size={20} className="text-gray-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[status] || statusConfig.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Loader2 size={40} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading withdrawal history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              btnName="Back"
              onClick={() => setActiveSubMenu("undefined")}
              extraCss="px-4 py-2 rounded-lg flex items-center gap-2"
              bgColour="bg-gray-100"
              textColour="text-gray-700"
              hoverBgColour="hover:bg-gray-200"
            >
              <ArrowLeft size={18} />
            </Button>
            <h2 className="text-2xl font-bold text-gray-800">Withdrawal History</h2>
          </div>
          
          <button
            onClick={loadWithdrawals}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          <Filter size={18} className="text-gray-600 flex-shrink-0" />
          {["all", "pending", "processing", "completed", "failed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                filter === status
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Withdrawals List */}
        {withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <Download size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Withdrawals Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" 
                ? "You haven't made any withdrawal requests yet."
                : `No ${filter} withdrawals found.`}
            </p>
            <Button
              btnName="Make a Withdrawal"
              onClick={() => setActiveSubMenu("withdraw")}
              extraCss="px-6 py-3 rounded-lg"
              bgColour="bg-yellow-400"
              textColour="text-white"
              hoverBgColour="hover:bg-yellow-500"
              fontTextStyle="font-semibold"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        {withdrawal.withdrawal_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(withdrawal.created_at)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="font-semibold text-gray-800">
                      ${withdrawal.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fee</p>
                    <p className="text-red-600 font-semibold">
                      -${withdrawal.processing_fee.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Net Amount</p>
                    <p className="font-semibold text-green-600">
                      ${withdrawal.net_amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Method</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {withdrawal.method}
                    </p>
                  </div>
                </div>

                {/* Withdrawal Details */}
                {withdrawal.method === "bank" && (
                  <div className="bg-gray-50 rounded p-3 text-sm mb-3">
                    <p className="text-gray-600">
                      <span className="font-semibold">Bank:</span> {withdrawal.details.bankName}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Account:</span> •••• {withdrawal.details.accountNumber.slice(-4)}
                    </p>
                  </div>
                )}

                {withdrawal.method === "crypto" && (
                  <div className="bg-gray-50 rounded p-3 text-sm mb-3">
                    <p className="text-gray-600">
                      <span className="font-semibold">Currency:</span> {withdrawal.details.currency.toUpperCase()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Network:</span> {withdrawal.details.network}
                    </p>
                    <p className="text-gray-600 break-all">
                      <span className="font-semibold">Address:</span> {withdrawal.details.walletAddress}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {withdrawal.notes && (
                  <p className="text-sm text-gray-600 italic mb-3">
                    Note: {withdrawal.notes}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {withdrawal.status === "pending" && (
                    <button
                      onClick={() => handleCancelWithdrawal(withdrawal.withdrawal_id)}
                      disabled={cancellingId === withdrawal.withdrawal_id}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {cancellingId === withdrawal.withdrawal_id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          Cancel Withdrawal
                        </>
                      )}
                    </button>
                  )}
                  
                  {withdrawal.status === "completed" && withdrawal.details.transaction_hash && (
                    <button
                      onClick={() => {
                        // Open blockchain explorer (example for Ethereum)
                        const explorerUrl = `https://etherscan.io/tx/${withdrawal.details.transaction_hash}`;
                        window.open(explorerUrl, '_blank');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium"
                    >
                      View on Blockchain
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}