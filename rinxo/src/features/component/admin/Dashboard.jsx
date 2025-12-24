import {
  ChevronDown,
  CreditCard,
  DollarSign,
  Download,
  Send,
} from "lucide-react"; 
import { adminStats } from "./config/dashboardStats";
export default function Dashboard({userData}) {
  
  return (
  <>
  
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {adminStats(userData).map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                {stat.icon && <stat.icon className="text-white" size={24} />}

              </div>
              <span className="text-green-500 text-sm font-semibold">
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* My Funds Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="text-gray-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-700">Total Funds</h2>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-600">USD</span>
          <ChevronDown size={16} className="text-gray-600" />
          <span className="text-4xl font-bold text-gray-800 ml-2">$ 0.00</span>
        </div>
        
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Shortcuts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Deposit History",
            "Withdrawal History",
            "Transfer History",
            "My Clients",
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div>
              <span className="text-sm text-gray-700 text-center">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
  );
}

