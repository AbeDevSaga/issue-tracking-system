// src/components/auth/ForgotPassword.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AiOutlinePhone,
  AiOutlineLock,
  AiOutlineArrowLeft,
  AiOutlineSafety,
  AiOutlineReload,
} from "react-icons/ai";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEthiopianPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");

    // Phone numbers: 9XXXXXXXXX or 09XXXXXXXX or 251XXXXXXXXX
    const patterns = [
      /^9\d{8}$/, // 9XXXXXXXX (9 digits starting with 9)
      /^9\d{9}$/, // 9XXXXXXXXX (10 digits starting with 9)
      /^09\d{8}$/, // 09XXXXXXXX (10 digits starting with 09)
      /^09\d{9}$/, // 09XXXXXXXXX (11 digits starting with 09)
      /^251\d{9}$/, // 251XXXXXXXXX (12 digits starting with 251)
    ];

    return patterns.some((pattern) => pattern.test(cleanPhone));
  };

  // Format  phone number for display
  const formatEthiopianPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 1) {
      return cleaned;
    } else if (cleaned.length <= 3) {
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1)}`;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(
        4
      )}`;
    } else {
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7, 10)}`;
    }
  };

  // Clean phone number for API (remove all formatting)
  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  // Request OTP via SMS
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = cleanPhoneNumber(phoneNumber);
    if (!validateEthiopianPhoneNumber(cleanPhone)) {
      toast.error("Please enter a valid  phone number (e.g., 9-123-456-789)");
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:4000";
      const response = await fetch(
        `${API_BASE_URL}/api/auth/password-reset/sms/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: cleanPhone }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("OTP sent successfully to your phone");
        setStep(2);
        setCountdown(60); // 1 minute countdown
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:4000";
      const cleanPhone = cleanPhoneNumber(phoneNumber);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/password-reset/sms/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: cleanPhone,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("OTP verified successfully");
        setStep(3);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:4000";
      const cleanPhone = cleanPhoneNumber(phoneNumber);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/password-reset/sms/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: cleanPhone,
            otp,
            newPassword,
          }),
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
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:4000";
      const cleanPhone = cleanPhoneNumber(phoneNumber);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/password-reset/sms/request`,
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

        if (data.otp) {
          console.log("OTP:", data.otp);
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

  // Go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) {
        setOtp("");
        setCountdown(0);
      } else if (step === 3) {
        setNewPassword("");
        setConfirmPassword("");
      }
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Reset Your Password";
      case 2:
        return "Verify OTP";
      case 3:
        return "Create New Password";
      default:
        return "Reset Your Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Enter your  phone number to receive OTP via SMS";
      case 2:
        return "Enter the 6-digit OTP sent to your phone";
      case 3:
        return "Enter your new password";
      default:
        return "Enter your phone number to receive OTP via SMS";
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      {/* Back Button */}
      <Link
        to="/login"
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
      >
        <AiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-medium">Back to Login</span>
      </Link>

      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
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

        {/* Form Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
          {/* Step 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              {/* Phone Input */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlinePhone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(formatEthiopianPhoneNumber(e.target.value))
                    }
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                    placeholder="9-123-456-789"
                    maxLength={14}
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Enter your phone number (e.g., 912345678, 0912345678)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !validateEthiopianPhoneNumber(cleanPhoneNumber(phoneNumber))
                }
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <AiOutlineSafety className="w-6 h-6" />
                    <span>Send OTP via SMS</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-slate-700"
                >
                  Enter 6-digit OTP
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="block w-full px-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-2xl font-mono text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-slate-500 text-center">
                  OTP sent to {getFormattedPhoneDisplay()}
                </p>
                <p className="text-xs text-slate-400 text-center">
                  Check your SMS messages for the verification code
                </p>
              </div>

              {/* Action Buttons */}
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
                  disabled={loading || otp.length !== 6}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
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

              {/* Action Buttons */}
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
                  type="submit"
                  disabled={
                    loading ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AiOutlineSafety className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Secure Password Reset
                </p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  {step === 1 &&
                    "You'll receive a 6-digit OTP via SMS. The OTP will expire in 10 minutes for your security."}
                  {step === 2 &&
                    "Enter the 6-digit OTP sent to your phone. You have 3 attempts before the OTP expires."}
                  {step === 3 &&
                    "Create a strong new password. Make sure it's at least 6 characters long."}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Help */}
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
