import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Dashboard from "../admin/Dashboard";
import UserDashboard from "../user/Dashboard";
import UserProfile from "../admin/UserProfile";
import ManageFunds from "../admin/ManageFunds";
import UserSettings from "../user/UserSettings";
import UserManageFunds from "../user/UserManageFunds";
import UserDeposit from "../user/payment/UserDeposit";
import UserWithdraw from "../user/payment/UserWithdraw";
import VerifyIdentity from "../../../components/verificationPages/VerifyIdentity";
import { usersData } from "../../../utils/user.utils";

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

  const [modalOpen, setModalOpen] = useState(false);

  const [showWarning, setShowWarning] = useState(false); // warning popup

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await usersData();
      setUsers(data.data);
    };
    fetchUsers();
  }, []);
  // Show warning popup on page load
  useEffect(() => {
    // Only for user role
    if (role === "user") {
      const timer = setTimeout(() => {
        setShowWarning(true);
      }, 500); // small delay for UX
      return () => clearTimeout(timer);
    }
  }, [role]);

  // ✅ Reset sub menu when main menu changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSubMenu("undefined");
    }, 0);

    return () => clearTimeout(timer);
  }, [activeMenu]);

  return (
    <>
      <VerifyIdentity
        showWarning={showWarning}
        setShowWarning={setShowWarning}
        setModalOpen={setModalOpen}
        modalOpen={modalOpen}
      />

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
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-auto">
          {role === "admin" && (
            <>
              {activeMenu === "dashboard" && <Dashboard  userData={users}/>}
              {activeMenu === "users" && (
                <UserProfile users={users} setUsers={setUsers} />
              )}
              {activeMenu === "funds" && <ManageFunds users={users} />}
            </>
          )}
          {role === "user" && (
            <>
              {activeMenu === "dashboard" && <UserDashboard />}
              {activeMenu === "settings" && <UserSettings />}
              {/* {activeMenu === "myFunds" && <UserManageFunds />} */}
              {activeMenu === "myFunds" &&
                {
                  deposit: <UserDeposit setActiveSubMenu={setActiveSubMenu} />,
                  withdraw: (
                    <UserWithdraw setActiveSubMenu={setActiveSubMenu} />
                  ),
                  undefined: (
                    <UserManageFunds setActiveSubMenu={setActiveSubMenu} />
                  ),
                }[activeSubMenu]}
            </>
          )}
        </section>
      </main>
    </>
  );
}
