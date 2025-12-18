// src/components/auth/ForgotPassword.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AiOutlinePhone,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineArrowLeft,
  AiOutlineSafety,
  AiOutlineReload,
} from "react-icons/ai";

type ResetMethod = "email" | "phone" | null;

export default function ForgotPassword() {
  const [method, setMethod] = useState<ResetMethod>(null);
  const [step, setStep] = useState(1); // 1: Choose method, 2: Request, 3: Verify OTP/Email Sent
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Array for 6 boxes
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize OTP refs
  useEffect(() => {
    otpRefs.current = otpRefs.current.slice(0, 6);
  }, []);

  // Focus first OTP input when step changes to OTP verification
  useEffect(() => {
    if (step === 3 && method === "phone" && otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step, method]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Method selection handler
  const handleMethodSelect = (selectedMethod: ResetMethod) => {
    setMethod(selectedMethod);
    setStep(2);
  };

  const validateEthiopianPhoneNumber = (phone: string) => {
    const clean = phone.replace(/\D/g, "");

    // Ethiopian phone numbers should have 12 digits total (251 + 9 digits)
    // or 10 digits (09 format) or 9 digits (9 format)

    // +2519XXXXXXXX  OR  2519XXXXXXXX (12 digits total)
    if (clean.startsWith("251") && clean.length === 12 && clean[3] === "9") {
      return true;
    }

    // 09XXXXXXXX  (10 digits)
    if (clean.startsWith("09") && clean.length === 10) {
      return true;
    }

    // 9XXXXXXXX  (9 digits)
    if (clean.startsWith("9") && clean.length === 9) {
      return true;
    }

    // Allow partial input during typing (minimum 4 digits: 2519)
    if (clean.startsWith("2519") && clean.length >= 4 && clean.length <= 12) {
      return true;
    }

    return false;
  };

  const formatEthiopianPhoneNumber = (value: string) => {
    let clean = value.replace(/\D/g, "");

    // Normalize to start with 251
    if (clean.startsWith("0")) {
      clean = "251" + clean.slice(1);
    } else if (clean.startsWith("9")) {
      clean = "251" + clean;
    } else if (!clean.startsWith("251")) {
      clean = "251" + clean;
    }

    // Allow full 12 digits (251 + 9 digits)
    clean = clean.slice(0, 12);

    // Display format with proper spacing for Ethiopian numbers
    const country = "+251";

    if (clean.length >= 4) {
      const p1 = clean.slice(3, 4); // 9 (first digit after country code)
      const p2 = clean.slice(4, 6); // 95 (next two digits)
      const p3 = clean.slice(6, 9); // 475 (next three digits)
      const p4 = clean.slice(9, 12); // remaining digits

      let formatted = `${country}`;
      if (p1) formatted += ` ${p1}`;
      if (p2) formatted += ` ${p2}`;
      if (p3) formatted += ` ${p3}`;
      if (p4) formatted += ` ${p4}`;

      return formatted.trim();
    }

    return `${country} ${clean.slice(3)}`;
  };

  const cleanPhoneNumber = (phone: string) => {
    let clean = phone.replace(/\D/g, "");

    // Normalize to 251 format
    if (clean.startsWith("0")) {
      clean = "251" + clean.slice(1);
    } else if (clean.startsWith("9")) {
      clean = "251" + clean;
    }

    // Ensure we have exactly 12 digits for Ethiopian numbers
    if (clean.startsWith("251") && clean.length > 12) {
      clean = clean.slice(0, 12);
    }

    return clean;
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      setTimeout(() => {
        otpRefs.current[index + 1]?.focus();
      }, 10);
    }
  };
  const validatePassword = (password) => {
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!uppercase)
      return "Password must include at least one uppercase letter.";
    if (!lowercase)
      return "Password must include at least one lowercase letter.";
    if (!specialChar)
      return "Password must include at least one special character.";
    if (password.length < 6)
      return "Password must be at least 6 characters long.";

    return ""; // No errors
  };
  // Handle OTP key down (backspace navigation)
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setTimeout(() => {
          otpRefs.current[index - 1]?.focus();
        }, 10);
      } else if (otp[index]) {
        // Clear current input and stay there
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // Arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, index) => {
        if (index < 6) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((val) => val === "");
      if (nextEmptyIndex !== -1) {
        setTimeout(() => {
          otpRefs.current[nextEmptyIndex]?.focus();
        }, 10);
      } else {
        setTimeout(() => {
          otpRefs.current[5]?.focus();
        }, 10);
      }
    }
  };
// ===================== Request Reset =====================
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (method === "phone") {
      const cleanPhone = cleanPhoneNumber(phoneNumber);
      if (!validateEthiopianPhoneNumber(cleanPhone)) {
        toast.error("Please enter a valid Ethiopian phone number");
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      let endpoint = "";
      let payload: Record<string, string> = {};

      if (method === "phone") {
        endpoint = "/auth/password-reset/sms/request";
        payload = { phoneNumber: cleanPhoneNumber(phoneNumber) };
      } else {
        endpoint = "/auth/password-reset/email/request";
        payload = { email: email.trim() };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (method === "phone") {
          toast.success("OTP sent to your phone");
          setStep(3);
          setCountdown(60);
          if (data.otp) {
            console.log("Development OTP:", data.otp);
            toast.info(`Development OTP: ${data.otp}`);
          }
        } else {
          toast.success("Password reset link sent to your email");
          setStep(3);
        }
      } else {
        toast.error(data.message || "Failed to send reset instructions");
      }
    } catch (error) {
      console.error("Request reset error:", error);
      toast.error("Failed to send reset instructions");
    } finally {
      setLoading(false);
    }
  };

  // ===================== Verify OTP =====================
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const cleanPhone = cleanPhoneNumber(phoneNumber);

      const response = await fetch(
        `${API_BASE_URL}/auth/password-reset/sms/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: cleanPhone, otp: otpString }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("OTP verified successfully");
        setStep(4);
      } else {
        toast.error(data.message);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 10);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error("Failed to verify OTP");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 10);
    } finally {
      setLoading(false);
    }
  };

  // ===================== Resend OTP =====================
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const cleanPhone = cleanPhoneNumber(phoneNumber);

      const response = await fetch(
        `${API_BASE_URL}/auth/password-reset/sms/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: cleanPhone }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("OTP sent successfully");
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 10);

        if (data.otp) {
          console.log("Development OTP:", data.otp);
          toast.info(`Development OTP: ${data.otp}`);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ===================== Reset Password =====================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const otpString = otp.join("");
      const cleanPhone = cleanPhoneNumber(phoneNumber);

      const response = await fetch(
        `${API_BASE_URL}/auth/password-reset/sms/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: cleanPhone, otp: otpString, newPassword }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Back navigation
  const handleBack = () => {
    if (step > 1) {
      if (step === 2) {
        setMethod(null);
        setStep(1);
      } else if (step === 3) {
        setStep(2);
        setOtp(["", "", "", "", "", ""]);
        setCountdown(0);
      } else if (step === 4) {
        setStep(3);
        setNewPassword("");
        setConfirmPassword("");
      }
    }
  };

  // Get formatted phone for display
  const getFormattedPhoneDisplay = () => {
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    if (cleanPhone.startsWith("0")) {
      return `+251${cleanPhone.slice(1)}`;
    } else if (cleanPhone.startsWith("251")) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith("9")) {
      return `+251${cleanPhone}`;
    }
    return phoneNumber;
  };

  // Step titles and descriptions
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Reset Your Password";
      case 2:
        return method === "phone"
          ? "Enter Your Phone Number"
          : "Enter Your Email";
      case 3:
        return method === "phone" ? "Verify OTP" : "Check Your Email";
      case 4:
        return "Create New Password";
      default:
        return "Reset Your Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Choose how you want to reset your password";
      case 2:
        return method === "phone"
          ? "We'll send a verification code via SMS"
          : "We'll send a secure reset link to your email";
      case 3:
        return method === "phone"
          ? "Enter the 6-digit OTP sent to your phone"
          : "We've sent a password reset link to your email address";
      case 4:
        return "Enter your new password below";
      default:
        return "";
    }
  };

  // Step 1: Method Selection
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
        <Link
          to="/login"
          className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
        >
          <AiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Login</span>
        </Link>

        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AiOutlineSafety className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {getStepTitle()}
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                {getStepDescription()}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
            <div className="grid gap-4">
              <button
                onClick={() => handleMethodSelect("email")}
                className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <AiOutlineMail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Email Reset</h3>
                  <p className="text-sm text-slate-600">
                    Get a secure reset link via email
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect("phone")}
                className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                  <AiOutlinePhone className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">SMS OTP</h3>
                  <p className="text-sm text-slate-600">
                    Get a verification code via SMS
                  </p>
                </div>
              </button>
            </div>

            <div className="text-center pt-4 border-t border-slate-200/60">
              <p className="text-slate-600 text-sm">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Log in to your account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Input contact information
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
        <button
          onClick={handleBack}
          className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
        >
          <AiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back</span>
        </button>

        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {getStepTitle()}
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              {getStepDescription()}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
            <form onSubmit={handleRequestReset} className="space-y-6">
              {method === "phone" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlinePhone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(
                          formatEthiopianPhoneNumber(e.target.value)
                        );
                      }}
                      className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                      placeholder="+251 9XX XXX XXX"
                      maxLength={18}
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter your phone number (e.g., +25912345678, 0912345678)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AiOutlineMail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <AiOutlineSafety className="w-6 h-6" />
                    <span>
                      Send {method === "phone" ? "OTP" : "Reset Link"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Verify OTP (phone) or Email Sent Confirmation (email)
  if (step === 3) {
    if (method === "phone") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
          <button
            onClick={handleBack}
            className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
          >
            <AiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back</span>
          </button>

          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {getStepTitle()}
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                {getStepDescription()}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 text-center">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-200 bg-white"
                        autoComplete="one-time-code"
                        disabled={loading}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 text-center">
                    OTP sent to {getFormattedPhoneDisplay()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || countdown > 0}
                    className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <AiOutlineReload className="w-4 h-4" />
                    {countdown > 0 ? `${countdown}s` : "Resend"}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.join("").length !== 6}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    } else {
      // Email sent confirmation
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
          <button
            onClick={handleBack}
            className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
          >
            <AiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back</span>
          </button>

          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AiOutlineMail className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Check Your Email
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700 text-center">
                    Click the link in the email to reset your password. The link
                    will expire in 1 hour.
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-600">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <button
                    onClick={handleRequestReset}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    Click here to resend
                  </button>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-200/60">
                <p className="text-slate-600 text-sm">
                  Remembered your password?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Log in to your account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Step 4: Reset Password (Phone only)
  if (step === 4 && method === "phone") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
        <button
          onClick={handleBack}
          className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
        >
          <AiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back</span>
        </button>

        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {getStepTitle()}
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              {getStepDescription()}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      const error = validatePassword(e.target.value);
                      setPasswordError(error);
                    }}
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />

                  {/* 4. Show the validation message */}
                  {passwordError && (
                    <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={
                    loading ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    passwordError
                  }
                  className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="flex-1 bg-linear-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
