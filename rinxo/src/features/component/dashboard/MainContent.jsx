import React, { useEffect } from "react";
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

  // ✅ Reset sub menu when main menu changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSubMenu("undefined");
    }, 0); 
    return () => clearTimeout(timer);
  }, [activeMenu]);

  return (
    <>
      {/* <VerifyIdentity user={userData}  
      /> */}

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
              {activeMenu === "dashboard" && <Dashboard />}
              {activeMenu === "users" && <UserProfile />}
              {activeMenu === "funds" && <ManageFunds />}
              {activeMenu === "settings" && <Settings user={userData} />}
            </>
          )}
          {role === "user" && (
            <>
              {/* <VerificationRoute setActiveSubMenu={setActiveSubMenu}> */}

              {/* {activeMenu === "dashboard" && <UserDashboard />} */}
              {activeMenu === "dashboard" &&
                {
                  deposit: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserDeposit setActiveSubMenu={setActiveSubMenu} user={userData}/>
                    </VerificationRoute>
                  ),
                  withdraw: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserWithdraw setActiveSubMenu={setActiveSubMenu} />
                    </VerificationRoute>
                    
                  ),
                  undefined: (
                    <UserDashboard setActiveSubMenu={setActiveSubMenu} />
                  ),
                }[activeSubMenu]}
              {activeMenu === "settings" && <Settings user={userData} />}

              {activeMenu === "myFunds" &&
                {
                  deposit: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserDeposit setActiveSubMenu={setActiveSubMenu} />
                    </VerificationRoute>
                  ),
                  withdraw: (
                    <VerificationRoute setActiveSubMenu={setActiveSubMenu}>
                      <UserWithdraw setActiveSubMenu={setActiveSubMenu} />
                    </VerificationRoute>
                    
                  ),
                  undefined: (
                    <UserManageFunds setActiveSubMenu={setActiveSubMenu} />
                  ),
                }[activeSubMenu]}

              {/* </VerificationRoute> */}
            </>
          )}
        </section>
      </main>
    </>
  );
}
