// import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import { API } from "../utils/auth.utils";

// const ProtectedRoute = ({ children }) => {
//   const [isAuth, setIsAuth] = useState(null);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await API.get("/auth/check");

//         if (res.data.success) {
//           setIsAuth(true);
//           setUser(res.data.user); // full user object
//         } else {
//           setIsAuth(false);
//         }
//       } catch (err) {
//         console.error(err);
//         setIsAuth(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   if (isAuth === null) return <div>Loading...</div>;
//   if (!isAuth) return <Navigate to="/login" replace />;

//   return React.Children.map(children, (child) =>
//     React.isValidElement(child) ? React.cloneElement(child, { user }) : child
//   );
// };

// export default ProtectedRoute;


import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API } from "../utils/auth.utils";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/check");
        if (res.data.success) {
          setIsAuth(true);
          setUser(res.data.user);
        } else {
          setIsAuth(false);
        }
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  return React.Children.map(children, (child) =>
  React.isValidElement(child)
    ? React.cloneElement(child, { user })
    : child
);

};

export default ProtectedRoute;
