import axios from "axios";

/**
 * Axios instance
 * Change baseURL according to your environment
 */
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/* =====================================================
   REGISTER USER
   Backend: POST /api/auth/register
   ===================================================== */
export const registerUser = async (payload) => {
  try {
    const response = await API.post("/auth/register", payload);
    return response.data || response.json();
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Registration failed",
      }
    );
  }
};

/* =====================================================
   VERIFY EMAIL (LINK BASED)
   Backend: GET /api/auth/verify-email/:token
   ===================================================== */
export const verifyEmail = async (token) => {
  try {
    const response = await API.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Invalid or expired verification link",
      }
    );
  }
};

/* =====================================================
   RESEND VERIFICATION EMAIL (LINK BASED)
   Backend: GET /api/auth/resend-email-verification/:token
   ===================================================== */
export const resendEmailVerificationAPI = async (token) => {
  try {
    const response = await API.get(`/auth/resend-email-verification/${token}`);
    return response;
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Invalid or expired verification link",
      }
    );
  }
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (payload) => {
  try {
    const response = await API.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Login failed",
      }
    );
  }
};

export const logout = async () => {
  try {
    const response = await API.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Logout failed",
      }
    );
  }
};

 