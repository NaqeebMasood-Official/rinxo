import React, { useState } from "react";
import {
  CircleDollarSign,
  HandCoins,
  Send,
  Landmark,
  FileText,
} from "lucide-react";
import Button from "../../../components/common/Button/Button";

export default function UserManageFunds({ setActiveSubMenu }) {
  const [balance, setBalance] = useState(2500.0);
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Deposit", amount: 500, date: "2025-12-19" },
    { id: 2, type: "Withdrawal", amount: 200, date: "2025-12-18" },
    { id: 3, type: "Deposit", amount: 1000, date: "2025-12-17" },
  ]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Wallet Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CircleDollarSign size={28} className="text-gray-600" />
          <div>
            <p className="text-sm text-gray-500">Wallet Balance</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-800">
              ${balance.toLocaleString()}
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

          {/* <Button
            btnName="Transfer"
            locationHref="/transfer"
            extraCss="flex-1 sm:flex-none px-5 py-2 rounded-3xl flex items-center justify-center gap-2"
            bgColour="bg-blue-500"
            textColour="text-white"
            hoverBgColour="hover:bg-blue-600 transition"
            fontTextStyle="font-semibold"
          >
            <Send />
          </Button> */}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText size={20} /> Recent Transactions
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "Deposit"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.type === "Deposit" ? (
                      <HandCoins size={16} />
                    ) : (
                      <Landmark size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{tx.type}</p>
                    <p className="text-gray-500 text-sm">{tx.date}</p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    tx.type === "Deposit" ? "text-green-700" : "text-red-500"
                  }`}
                >
                  {tx.type === "Deposit" ? "+" : "-"}$
                  {tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
