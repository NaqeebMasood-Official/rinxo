import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import LoginLogo from "../../src/assets/images/user/icons/prelogin_logo.png";
import TopSlideLoading from "../components/common/Loading/TopSlideLoading";
import { registerUser, resendEmailVerificationAPI } from "../utils/auth.utils";
import { toast } from "react-toastify";

export default function Register() {
  /* ================= STATES ================= */
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [countryCode, setCountryCode] = useState("+1");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState("");

  /* ================= PAGE LOADER ================= */
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  /* ================= HANDLERS ================= */
  const togglePassword = () => setPasswordVisible(!passwordVisible);

  const getValue = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const normalizePhoneNumber = (countryCode, phone) => {
    let cleaned = phone.replace(/\D/g, ""); // remove non-numeric

    // Remove leading 0 (Pakistan, UK, etc.)
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }

    return `${countryCode}${cleaned}`;
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    let temp = {};

    if (!formData.fullName.trim()) temp.fullName = "Full name is required";

    if (!formData.email) temp.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      temp.email = "Invalid email address";

    if (!formData.phone) {
      temp.phone = "Phone number is required";
    } else {
      const cleaned = formData.phone.replace(/\D/g, "");

      if (cleaned.length < 7 || cleaned.length > 12) {
        temp.phone = "Invalid phone number";
      }
    }

    if (!formData.password) temp.password = "Password is required";
    else if (formData.password.length < 6)
      temp.password = "Minimum 6 characters";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ================= REGISTER ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    setActionLoading(true);

    try {
      const phoneNumber = normalizePhoneNumber(countryCode, formData.phone);

      const result = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber, // ✅ CLEAN & CORRECT
      });
      setToken(result.token);
      toast.success("Registered successfully! Please verify your email.");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setActionLoading(false);
    }
  };

  const resendEmailVerification = async () => {
    try {
      const response = await resendEmailVerificationAPI(token);
      // if (!response.ok) {
      //   throw new Error(`HTTP Error! Status: ${response.status}`);
      // }
      const result = response;
      console.log("result: ", result);
    } catch (err) {
      console.error("Error resending verification email", err.message);
      toast.error("Failed to resend email verification!");
    }
  };

  /* =====================================================
     ❌ OTP / PIN CODE FLOW (NOT USED)
     Backend uses EMAIL VERIFICATION LINK
     ===================================================== */
  /*
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  const handleVerifyCode = () => {};
  */

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <TopSlideLoading show={pageLoading} />

      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-5xl relative z-10 overflow-hidden">
        <img src={LoginLogo} alt="logo" className="w-48 mx-auto mb-6" />

        <h2 className="text-center text-2xl font-bold mb-8">
          Individual Account Registration
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={getValue}
              className={`w-full border rounded-md p-3 mt-1 text-sm focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-yellow-400"
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={getValue}
              className={`w-full border rounded-md p-3 mt-1 text-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-yellow-400"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">Phone</label>
            <div className="flex gap-2 mt-1">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="border rounded-md p-3 text-sm focus:outline-none focus:ring-2 border-gray-300 focus:ring-yellow-400"
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+92">+92</option>
              </select>

              <input
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phone: value });
                }}
                placeholder="3012345678"
                className={`flex-1 border rounded-md p-3 text-sm focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-yellow-400"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={getValue}
                className={`w-full border rounded-md p-3 pr-10 text-sm focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-yellow-400"
                }`}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-4 top-3 text-gray-400"
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Button */}
          <div className="col-span-full flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="px-24 py-3 rounded-full bg-yellow-400 text-white font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              {actionLoading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {actionLoading ? "Creating..." : "Register"}
            </button>
          </div>
          <div className="col-span-full flex justify-center mt-6">
            <button
              onClick={resendEmailVerification}
              // disabled={actionLoading}
              className="px-24 py-3 rounded-full bg-yellow-400 text-white font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              {/* {actionLoading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )} */}
              {/* {actionLoading ? "Sending..." : "Resend Verification"} */}
              Resend Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
