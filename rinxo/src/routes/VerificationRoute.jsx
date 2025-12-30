import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API } from "../utils/auth.utils";
import VerifyIdentity from "../components/verificationPages/VerifyIdentity";

const VerificationRoute = ({ children, setActiveSubMenu }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/check");
        if (res.data.success) {
          setIsAuth(true);
          setUser(res.data.user);
        }
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  // 🚫 Block inactive users
  if (user.role === "user" && user.status === "inActive") {
    return <VerifyIdentity user={user} setActiveSubMenu={setActiveSubMenu} />;
  }

  // Prevent pending status users to access deposit or withdraw
  // if (user.role === "user" && user.status === "pending") {
  //   return <VerifyIdentity user={user} setActiveSubMenu={setActiveSubMenu} />;
  // }

  return children;
};

export default VerificationRoute;
