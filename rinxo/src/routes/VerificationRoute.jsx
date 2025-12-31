import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API } from "../utils/auth.utils";
import VerifyIdentity from "../components/verificationPages/VerifyIdentity";
import { specificData } from "../utils/user.utils";
import PendingIdentity from "../components/verificationPages/PendingIdentity";

const VerificationRoute = ({ children, setActiveSubMenu }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const [user, setUser] = useState(null);

  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    const fetchUser = async () => {
      const data = await specificData(user._id);
      console.log(data.data);
      setUsers(data.data);
    };
    const timer = setTimeout(() => {
      fetchUser();
    }, 100);
    return () => clearTimeout(timer)
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  // 🚫 Block inactive users
  if (users.role === "user" && users.status === "inActive") {
    return <VerifyIdentity user={users} setActiveSubMenu={setActiveSubMenu} />;
  }

  // Prevent pending status users to access deposit or withdraw
  if (users.role === "user" && users.status === "pending") {
    return <PendingIdentity user={users} setActiveSubMenu={setActiveSubMenu} />;
  }

  return children;
};

export default VerificationRoute;
