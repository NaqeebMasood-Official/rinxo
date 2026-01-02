import { useEffect, useState } from "react";
import Button from "../../../../components/common/Button/Button";
import { ArrowLeft } from "lucide-react";
import WithdrawalTable from "./WithdrawalTable";
import DepositTable from "./DepositTable";
import PaymentsTable from "./PaymentsTable";
import TransactionTable from "./TransactionTable";
import { getUserWithdrawals } from "../../../../utils/withdrawal.utils";

const ManageFundsReport = ({ setShowReport, userId }) => {
  const [activeTab, setActiveTab] = useState(0);

  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const sidebarItems = ["Withdrawal", "Deposit", "Payments", "Transaction"];

  /* ------------------ FETCH DATA ------------------ */
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const data = await getUserWithdrawals({ userId });
        setWithdrawals(data);
      } catch (err) {
        console.error("Error Fetching Withdrawals:", err);
      }
    };

    const fetchDepositsAndTransactions = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/user/admin/user-transactions/${userId}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`HTTP ERROR! Status: ${response.status}`);
        }

        const result = await response.json();

        setDeposits(
          result.transactions.filter(
            (t) => t.status !== "pending" && t.type === "deposit"
          )
        );

        setTransactions(result.transactions);
      } catch (err) {
        console.error("Error Fetching Deposits:", err);
      }
    };

    const fetchPayments = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/user/admin/payments/${userId}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`HTTP ERROR! Status: ${response.status}`);
        }

        const result = await response.json();
        setPayments(result.payments);
      } catch (err) {
        console.error("Error Fetching Payments:", err);
      }
    };

    fetchWithdrawals();
    fetchDepositsAndTransactions();
    fetchPayments();
  }, [userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const getActiveData = () => {
    switch (activeTab) {
      case 0:
        return withdrawals;
      case 1:
        return deposits;
      case 2:
        return payments;
      case 3:
        return transactions;
      default:
        return [];
    }
  };

  const activeData = getActiveData();
  const totalPages = Math.ceil(activeData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = activeData.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex flex-col max-h-[88vh] overflow-hidden">
      <Button
        btnName="Back"
        onClick={() => setShowReport(false)}
        extraCss="fixed top-[70px] mb-4 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
        bgColour="bg-gray-100"
        textColour="text-gray-700"
        hoverBgColour="hover:bg-gray-200"
      >
        <ArrowLeft size={18} />
      </Button>

      <div className="flex flex-1 overflow-hidden mt-6">
        <div className="w-56 shrink-0 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={item}
                onClick={() => setActiveTab(index)}
                className={`w-full text-left px-4 py-3 transition-all
                  ${
                    activeTab === index
                      ? "bg-yellow-400 text-gray-900 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px bg-gray-200" />

        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {activeTab === 0 && <WithdrawalTable withdrawals={paginatedData} />}

            {activeTab === 1 && <DepositTable deposits={paginatedData} />}

            {activeTab === 2 && <PaymentsTable payments={paginatedData} />}

            {activeTab === 3 && (
              <TransactionTable transactions={paginatedData} />
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          }`}
        >
          Previous
        </button>

        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageFundsReport;
