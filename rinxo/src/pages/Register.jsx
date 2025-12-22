import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import LoginLogo from "../../src/assets/images/user/icons/prelogin_logo.png";
import TopSlideLoading from "../components/common/Loading/TopSlideLoading";

export default function Register() {
  /* ================= STATES ================= */
  const [step, setStep] = useState(1);

  // loaders
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
  const [code, setCode] = useState(["", "", "", ""]);

  const inputRefs = useRef([]);

  /* ================= PAGE LOADER ================= */
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  /* ================= HANDLERS ================= */
  const togglePassword = () => setPasswordVisible(!passwordVisible);

  const getValue = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ================= VALIDATION ================= */
  const validate = () => {
    let temp = {};

    if (!formData.fullName.trim())
      temp.fullName = "Full name is required";

    if (!formData.email)
      temp.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      temp.email = "Invalid email";

    if (!formData.phone)
      temp.phone = "Phone number is required";
    else if (!/^\d{7,15}$/.test(formData.phone))
      temp.phone = "Invalid phone number";

    if (!formData.password)
      temp.password = "Password is required";
    else if (formData.password.length < 6)
      temp.password = "Minimum 6 characters";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ================= REGISTER ================= */
  const handleSubmit = () => {
    if (!validate()) return;

    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      setStep(2);
    }, 1500);
  };

  /* ================= OTP ================= */
  const handleCodeChange = (i, val) => {
    if (val && !/^\d$/.test(val)) return;

    const newCode = [...code];
    newCode[i] = val;
    setCode(newCode);

    if (val && i < 3) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pasted)) return;

    const newCode = pasted.split("");
    setCode(newCode);
    inputRefs.current[newCode.length - 1]?.focus();
  };

  const handleVerifyCode = () => {
    if (code.join("").length < 4) return alert("Enter complete code");

    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      alert("Account verified successfully!");
    }, 1200);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <TopSlideLoading show={pageLoading} />

      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-5xl relative z-10 overflow-hidden">
        <img src={LoginLogo} alt="logo" className="w-48 mx-auto mb-6" />

        {/* ================= STEP 1 ================= */}
        <div
          className={`transition-all duration-500 ${
            step === 1
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-16 absolute inset-0 pointer-events-none"
          }`}
        >
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
                  className={`border rounded-md p-3 text-sm focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-yellow-400"
                  }`}
                >
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+92">+92</option>
                </select>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={getValue}
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
          </div>
        </div>

        {/* ================= STEP 2 ================= */}
        <div
          className={`transition-all duration-500 ${
            step === 2
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-16 absolute inset-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 mb-6 text-gray-600"
          >
            <ArrowLeft /> Back
          </button>

          <h2 className="text-center text-2xl font-bold mb-2">
            Verify Your Email
          </h2>

          <p className="text-center mb-8 text-gray-600">
            Code sent to <b>{formData.email}</b>
          </p>

          <div className="flex justify-center gap-3 mb-8">
            {code.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                value={d}
                maxLength={1}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-16 h-16 text-center text-2xl border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            ))}
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={actionLoading}
            className="w-full py-3 rounded-full bg-yellow-400 text-white font-semibold"
          >
            {actionLoading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
