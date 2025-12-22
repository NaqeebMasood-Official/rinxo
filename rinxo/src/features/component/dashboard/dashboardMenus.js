 
import {
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  Settings,
} from "lucide-react";

export const adminMenu = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "users", label: "User Profiles", icon: Users },
  { id: "funds", label: "Manage Funds", icon: DollarSign },
  { id: "trading", label: "Trading Accounts", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

export const userMenu = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "myFunds", label: "Manage Funds", icon: DollarSign },
  { id: "trades", label: "My Trades", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];


export const userSubMenu = [
  { id: "deposit", label: "Deposit", },
  { id: "withdraw", label: "Withdraw", },
  // { id: "transactions", label: "Transactions", }, 
];
