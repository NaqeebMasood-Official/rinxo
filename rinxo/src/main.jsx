import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./features/component/dashboard/Dashboard.jsx";
import EmailVerified from "./components/verificationPages/EmailVerified.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

import { Bounce, ToastContainer } from "react-toastify"; 
import PaymentStatus from "./features/component/user/payment/PaymentStatus.jsx";

const mainRoute = createBrowserRouter([
  // { path: "/", element: <Home /> },

  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },

  { path: "/verify-email/:token", element: <EmailVerified /> },
   {
    path: "/dashboard/payment-status",
    element: (
      <ProtectedRoute>
        <PaymentStatus />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={mainRoute} />
    <ToastContainer transition={Bounce} />
  </StrictMode>
);
