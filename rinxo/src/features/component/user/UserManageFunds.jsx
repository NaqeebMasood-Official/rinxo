import React, { useState } from "react";
import {
  CircleDollarSign,
  HandCoins,
  Send,
  Landmark,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../../components/common/Button/Button";
import { useEffect } from "react";
import { getUserTransactions } from "../../../utils/payment.utils"; 

export default function UserManageFunds({ setActiveSubMenu, user }) { 
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchFilter, setSearchFilter] = useState("All");
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  console.log(user);
  console.log(transactions);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getUserTransactions(user._id);
        console.log(response);
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTransactions();
  }, [user?._id]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return ()=> clearTimeout(timer)
  }, [statusFilter, searchFilter, limit]);

  // Apply filters first
  const filteredTransactions = transactions
    .filter(tx =>
      statusFilter === "All" ? true : tx.status === statusFilter
    )
    .filter(tx =>
      searchFilter === "All" ? true : tx.type === searchFilter
    );

  // Calculate pagination
  const itemsPerPage = limit === 0 ? filteredTransactions.length : limit;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get current page transactions
  const transactionsToDisplay = filteredTransactions.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Wallet Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CircleDollarSign size={28} className="text-gray-600" />
          <div>
            <p className="text-sm text-gray-500">Wallet Balance</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-800">
              ${user.funds.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setActiveSubMenu("deposit")}
            btnName="Deposit"
            extraCss="flex-1 sm:flex-none px-5 py-2 rounded-3xl flex items-center justify-center gap-2"
            bgColour="bg-yellow-400"
            textColour="text-white"
            hoverBgColour="hover:bg-yellow-500 transition"
            fontTextStyle="font-semibold"
          >
            <HandCoins />
          </Button>

          <Button
            btnName="Withdraw"
            onClick={() => setActiveSubMenu("withdraw")}
            extraCss="flex-1 sm:flex-none px-5 py-2 rounded-3xl flex items-center justify-center gap-2"
            bgColour="bg-red-500"
            textColour="text-white"
            hoverBgColour="hover:bg-red-600 transition"
            fontTextStyle="font-semibold"
          >
            <Landmark />
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          {/* LEFT: Heading */}
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center gap-2">
            <FileText size={20} />
            Recent Transactions
          </h2>

          {/* RIGHT: Selects */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="sm:w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdraw</option>
            </select>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="sm:w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={0}>All</option>
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              {transactionsToDisplay.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "deposit"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tx.type === "deposit" ? (
                        <HandCoins size={16} />
                      ) : (
                        <Landmark size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Id: ({tx.payment_id}) {tx.type}{" "}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold text-center ${
                      tx.status === "completed"
                        ? tx.type === "deposit"
                          ? "text-green-700"
                          : "text-red-500"
                        : "text-yellow-600"
                    }`}
                  >
                    {tx.type === "deposit" ? "+" : "-"}$
                    {tx.amount.toLocaleString()}
                    <br />
                    {tx.status}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {limit !== 0 && totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results info */}
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} transactions
                </p>

                {/* Pagination buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                      const showEllipsis =
                        (pageNum === 2 && currentPage > 3) ||
                        (pageNum === totalPages - 1 && currentPage < totalPages - 2);

                      if (showEllipsis) {
                        return (
                          <span key={pageNum} className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === pageNum
                              ? "bg-yellow-400 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}