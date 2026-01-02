import {
  ChevronDown,
  CircleDollarSign,
  HandCoins,
  Landmark,
  Send,
  UsersRound,
} from "lucide-react";
import Button from "../../../components/common/Button/Button";

export default function Dashboard({ setActiveSubMenu,user }) { 
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* My Funds Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <CircleDollarSign className="text-gray-600" size={20} />
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">
            My Funds
          </h2>
        </div>

        {/* Balance */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-gray-600 text-sm">USD</span>
          <ChevronDown size={16} className="text-gray-600" />
          <span className="text-3xl sm:text-4xl font-bold text-gray-800 ml-1">
           {Number(user?.funds || 0).toFixed(2)}

          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            btnName="Deposit"
            onClick={() => setActiveSubMenu("deposit")}
            extraCss="px-5 py-2 rounded-3xl flex items-center justify-center gap-1 w-full sm:w-auto"
            bgColour="bg-yellow-400"
            textColour="text-white"
            hoverBgColour="hover:bg-yellow-500 transition"
            fontTextStyle="font-semibold"
          >
            <HandCoins />
          </Button>

          {/* <Button
            btnName="Transfer"
            onClick={() => setActiveSubMenu("undefined")}
            extraCss="px-5 py-2 rounded-3xl shadow flex items-center justify-center gap-1 w-full sm:w-auto"
            bgColour=""
            textColour="text-yellow-400"
            hoverBgColour="hover:bg-yellow-50 hover:text-yellow-300 hover:border-yellow-300 transition"
            fontTextStyle="font-semibold"
          >
            <Send className="w-4 h-4" />
          </Button> */}

          <Button
            btnName="Withdraw"
            onClick={() => setActiveSubMenu("withdraw")}
            extraCss="px-5 py-2 rounded-3xl shadow flex items-center justify-center gap-1 w-full sm:w-auto"
            bgColour=""
            textColour="text-yellow-400"
            hoverBgColour="hover:bg-yellow-50 hover:text-yellow-300 hover:border-yellow-300 transition"
            fontTextStyle="font-semibold"
          >
            <Landmark className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* My Referrals Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <UsersRound className="text-gray-600" size={20} />
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">
            Number of Referrals
          </h2>
        </div>

        <span className="text-3xl sm:text-4xl font-bold text-gray-800">0</span>
      </div>

      {/* Shortcuts */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
          Shortcuts
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            "Deposit History",
            "Withdrawal History",
            "Tickets",
            "My Clients",
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full mb-2" />
              <span className="text-xs sm:text-sm text-gray-700 text-center">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
