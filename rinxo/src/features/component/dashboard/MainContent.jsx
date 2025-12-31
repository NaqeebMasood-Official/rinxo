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
import VerifyIdentity from "../../../components/verificationPages/VerifyIdentity";

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
      }, [activeSubMenu]);

  // ✅ Reset sub menu when main menu changes
 useEffect(() => {
    setActiveSubMenu("undefined");
  }, [activeMenu]);

// useEffect(() => {
//   if (userData?.role === "user" && userData?.status === "inActive") {
//     setActiveSubMenu("undefined");
//     activeMenu === "dashboard"
//     const timer = setTimeout(() => {
//       setShowVerify(true);
//     }, 0);

//     return () => clearTimeout(timer);
//   }
// }, []);


//     if (showVerify) {
//     return <VerifyIdentity user={userData} setActiveSubMenu={setActiveSubMenu} />;
//   }
 

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
          {
            users.role === "user" && (
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
            )
          }
          
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
