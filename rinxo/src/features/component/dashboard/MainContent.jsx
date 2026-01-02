import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Dashboard from "../admin/Dashboard";
import UserDashboard from "../user/Dashboard";
import UserProfile from "../admin/UserProfile";
import ManageFunds from "../admin/ManageFunds";
import UserManageFunds from "../user/UserManageFunds";
import UserDeposit from "../user/payment/UserDeposit";
import UserWithdraw from "../user/payment/UserWithdraw";
import VerificationRoute from "../../../routes/VerificationRoute";
import Settings from "./Settings";
import { specificData } from "../../../utils/user.utils";

export default function MainContent({
  sidebarOpen,
  setSidebarOpen,
  menuItems,
  activeMenu,
  userData,
  activeSubMenu,
  setActiveSubMenu,
}) {
  const role = userData.role;
    
      const [users, setUsers] = useState([]);
    // const [showVerify, setShowVerify] = useState(false);
    
      useEffect(() => {
        const fetchUser = async () => {
          const data = await specificData(userData._id);
          console.log(data.data)
          setUsers(data.data);
        };
        fetchUser();
      }, [activeSubMenu,activeMenu]);
       
  // ✅ Reset sub menu when main menu changes
 useEffect(() => {
    setActiveSubMenu("undefined");
  }, [activeMenu]);



  return (
    <>
      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 md:overflow-auto ${
          sidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center gap-4">
          {!sidebarOpen && (
            <button
              className="cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu />
            </button>
          )}
          <h1 className="text-xl font-bold capitalize">
            {menuItems.find((m) => m.id === activeMenu)?.label}
          </h1>
          {users.role === "user" && (
            <p
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                // in your table & modal
                users.status === "active"
                  ? "bg-green-100 text-green-700"
                  : users.status === "inActive"
                  ? "bg-gray-100 text-gray-700"
                  : users.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {users.status}
            </p>
          )}
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-auto">
          {role === "admin" && (
            <>
              {activeMenu === "dashboard" && <Dashboard />}
              {activeMenu === "users" && <UserProfile />}
              {activeMenu === "funds" && <ManageFunds />}
              {activeMenu === "settings" && <Settings user={userData} />}
            </>
          )}
          {role === "user" && (
            <>
              {activeMenu === "dashboard" &&
                {
                  deposit: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserDeposit setActiveSubMenu={setActiveSubMenu} user={users}/>
                    </VerificationRoute>
                  ),
                  withdraw: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserWithdraw setActiveSubMenu={setActiveSubMenu} user={users} />
                    </VerificationRoute>
                  ),
                  undefined: (
                    <UserDashboard user={users} setActiveSubMenu={setActiveSubMenu} />
                  ),
                }[activeSubMenu]}
              {activeMenu === "settings" && <Settings user={users} />}

              {activeMenu === "myFunds" &&
                {
                  deposit: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserDeposit setActiveSubMenu={setActiveSubMenu} user={users}/>
                    </VerificationRoute>
                  ),
                  withdraw: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserWithdraw setActiveSubMenu={setActiveSubMenu} user={users}/>
                    </VerificationRoute>
                  ),
                  undefined: (
                    <UserManageFunds setActiveSubMenu={setActiveSubMenu} user={users} />
                  ),
                }[activeSubMenu]}
            </>
          )}
        </section>
      </main>
    </>
  );
}
