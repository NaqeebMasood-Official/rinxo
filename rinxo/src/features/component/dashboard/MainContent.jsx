import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Dashboard from "../admin/Dashboard";
import UserDashboard from "../user/Dashboard";
import UserProfile from "../admin/UserProfile";
import ManageFunds from "../admin/ManageFunds"; 
import UserSettings from "../user/UserSettings";
import UserManageFunds from "../user/UserManageFunds";
import VerifyIdentityModal from "../user/VerifyIdentityModal";
import UserDeposit from "../user/payment/UserDeposit";
import UserWithdraw from "../user/payment/UserWithdraw";

export default function MainContent({ sidebarOpen, setSidebarOpen, menuItems, activeMenu, role, activeSubMenu, setActiveSubMenu }) {
  const [modalOpen, setModalOpen] = useState(false);

  const [showWarning, setShowWarning] = useState(false); // warning popup
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+12123213123",
      balance: 5000,
      accountType:"Standard",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+121232313123",
      balance: 3200,
      accountType:"Vip",
      status: "Active",
    },
  ]);

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

  const handleConfirmVerify = () => {
    setShowWarning(false); // hide warning
    setModalOpen(true);    // open modal
  };

  return (
    <>
      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Verify Identity
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Please verify your identity by uploading your CNIC front and back images.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmVerify}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Identity Modal */}
      <VerifyIdentityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
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
            <button className="cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
              {activeMenu === "dashboard" && <Dashboard />}
              {activeMenu === "users" && <UserProfile users={users} setUsers={setUsers} />}
              {activeMenu === "funds" && <ManageFunds users={users} />}
             
            </>
          )}
          {role === "user" && (
            <>
              {activeMenu === "dashboard" && <UserDashboard />}
              {activeMenu === "settings" && <UserSettings />}
              {/* {activeMenu === "myFunds" && <UserManageFunds />} */}
              {activeMenu === "myFunds" && {
                deposit: <UserDeposit setActiveSubMenu={setActiveSubMenu}/>,
                withdraw:<UserWithdraw setActiveSubMenu={setActiveSubMenu}/>, 
                undefined: <UserManageFunds setActiveSubMenu={setActiveSubMenu}/>,
              }[activeSubMenu]}
            </>
          )}
        </section>
      </main>
    </>
  );
}
