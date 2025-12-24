import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
} from "lucide-react";

/* ================== HELPERS ================== */
const isWithinDays = (date, days) => {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - days);
  return new Date(date) >= past;
};

const getPercentageChange = (current, previous) => {
  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "+100%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
};

/* ================== STATS ================== */
export const adminStats = (userData = []) => {
  const now = new Date();

  console.log(userData)
  // TOTAL USERS
  const totalUsers = userData.length;

  const usersLast7Days = userData.filter(u =>
    isWithinDays(u.createdAt, 7)
  ).length;

  const usersPrev7Days = userData.filter(u => {
    const date = new Date(u.createdAt);
    const sevenDaysAgo = new Date();
    const fourteenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    return date < sevenDaysAgo && date >= fourteenDaysAgo;
  }).length;

  // ACTIVE USERS
  const activeUsers = userData.filter(u => u.status === "active").length;
  const pendingUsers = userData.filter(u => u.status === "pending").length;
  const activeLast7Days = userData.filter(
    u => u.status === "active" && isWithinDays(u.createdAt, 7)
  ).length;

  const activePrev7Days = userData.filter(u => {
    const date = new Date(u.createdAt);
    const sevenDaysAgo = new Date();
    const fourteenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    return (
      u.status === "active" &&
      date < sevenDaysAgo &&
      date >= fourteenDaysAgo
    );
  }).length;

  const pendingLast7Days = userData.filter(
    u => u.status === "pending" && isWithinDays(u.createdAt, 7)
  ).length;

  const pendingPrev7Days = userData.filter(u => {
    const date = new Date(u.createdAt);
    const sevenDaysAgo = new Date();
    const fourteenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    return (
      u.status === "pending" &&
      date < sevenDaysAgo &&
      date >= fourteenDaysAgo
    );
  }).length;


  // FUNDS
  const totalFunds = userData.reduce(
    (sum, user) => sum + (user.funds || 0),
    0
  );

  // TRANSACTIONS
  // const totalTransactions = userData.reduce(
  //   (sum, user) => sum + (user.transactions?.length || 0),
  //   0
  // );

  return [
    {
      label: "Total Users",
      value: totalUsers,
      change: getPercentageChange(usersLast7Days, usersPrev7Days),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Users",
      value: activeUsers,
      change: getPercentageChange(activeLast7Days, activePrev7Days),
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "Pending Users",
      value: pendingUsers,
      change: getPercentageChange(pendingLast7Days, pendingPrev7Days),
      icon: Clock ,
      color: "bg-orange-500",
    },
    {
      label: "Total Funds",
      value: `$${totalFunds.toFixed(2)}`,
      change: "0%", // no fund history yet
      icon: DollarSign,
      color: "bg-purple-500",
    },
    
    // {
    //   label: "Total Transactions",
    //   value: totalTransactions,
    //   change: "0%", // no timestamps yet
    //   icon: CreditCard,
    //   color: "bg-orange-500",
    // },
  ];
};
