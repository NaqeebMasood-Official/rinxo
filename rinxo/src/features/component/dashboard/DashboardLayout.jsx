import React, { useState, useEffect } from "react";
import { adminMenu, userMenu, userSubMenu } from "./dashboardMenus";
import RissoxLogo from "../../../assets/images/user/icons/prelogin_logo.png";
import SideBar from "./SideBar";
import MainContent from "./MainContent";
import TopSlideLoading from "../../../components/common/Loading/TopSlideLoading";
const DashboardLayout = ({ user }) => {
  const userData = user;
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState("undefined");

  const menuItems = userData.role == "admin" ? adminMenu : userMenu;
  const subMenuItems = userSubMenu;

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile); // desktop open by default, mobile closed
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Hide loading when page fully loads
  useEffect(() => {
    // show loader asynchronously (avoids cascading render warning)
    const start = setTimeout(() => {
      setLoading(true);
    }, 0);

    // hide loader after delay
    const stop = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [activeMenu, activeSubMenu]);

  return (
    <>
      <TopSlideLoading show={loading} />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <SideBar
          sidebarOpen={sidebarOpen}
          RissoxLogo={RissoxLogo}
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
          menuItems={menuItems}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        {/* Main Content */}
        <MainContent
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          menuItems={menuItems}
          activeMenu={activeMenu}
          userData={userData}
          subMenuItems={subMenuItems}
          activeSubMenu={activeSubMenu}
          setActiveSubMenu={setActiveSubMenu}
        />
      </div>
    </>
  );
};

export default DashboardLayout;
