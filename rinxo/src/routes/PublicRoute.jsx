import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { API } from "../utils/auth.utils";

const PublicRoute = () => {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/check");
        if (res.data.success) {
          setIsAuth(true);
        }
      } catch {
        setIsAuth(false);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) return <div>Loading...</div>;

  // If already logged in → block login/register
  return isAuth ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
