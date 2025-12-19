// src/components/auth/ResetPasswordPage.tsx

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AiOutlineLock,
  AiOutlineArrowLeft,
  AiOutlineSafety,
} from "react-icons/ai";

const PasswordRule = ({ text, valid }: { text: string; valid: boolean }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <span className="text-green-600 font-bold">✔</span>
      ) : (
        <span className="text-slate-400 font-bold">✖</span>
      )}
      <span className={valid ? "text-green-700" : "text-slate-500"}>
        {text}
      </span>
    </div>
  );
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Password rule states
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Live password strength check
  useEffect(() => {
    const p = newPassword;

    setPasswordRules({
      length: p.length >= 6,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    });
  }, [newPassword]);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setValidating(false);
        setTokenValid(false);
        toast.error("Invalid reset link");
        return;
      }

     try {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(
    `${API_BASE_URL}/auth/password-reset/email/validate?token=${token}&email=${encodeURIComponent(email)}`
  );

  const data = await response.json();

  if (data.success && data.valid) {
    setTokenValid(true);
  } else {
    setTokenValid(false);
    toast.error("Invalid or expired reset link");
  }
} catch (error) {
  console.error("Token validation error:", error);
  setTokenValid(false);
  toast.error("Error validating reset link");
} finally {
  setValidating(false);
}
    };

    validateToken();
  }, [token, email]);

  const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    toast.error("Passwords don't match");
    return;
  }

  if (
    !passwordRules.length ||
    !passwordRules.uppercase ||
    !passwordRules.lowercase ||
    !passwordRules.number ||
    !passwordRules.special
  ) {
    toast.error("Password does not meet requirements");
    return;
  }

  setLoading(true);
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const response = await fetch(
      `${API_BASE_URL}/auth/password-reset/email/reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
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
    toast.error("Failed to reset password");
  } finally {
    setLoading(false);
  }
};

  // LOADING PAGE
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // INVALID LINK
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
        <Link
          to="/login"
          className="fixed top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group"
        >
          <AiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Login</span>
        </Link>

        <div className="max-w-md w-full text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AiOutlineSafety className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-slate-600 mb-6">
              This password reset link is invalid or has expired. Please request
              a new reset link.
            </p>
            <Link
              to="/forgot-password"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PAGE
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
            <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <AiOutlineLock className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create New Password
            </h1>
            <p className="text-slate-600 text-2xl leading-relaxed">
              Enter your new password below
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* NEW PASSWORD */}
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-slate-700">
                New Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineLock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-sm"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Rules Display */}
              <div className="mt-3 space-y-1">
                <PasswordRule
                  text="At least 6 characters"
                  valid={passwordRules.length}
                />
                <PasswordRule
                  text="One uppercase letter (A–Z)"
                  valid={passwordRules.uppercase}
                />
                <PasswordRule
                  text="One lowercase letter (a–z)"
                  valid={passwordRules.lowercase}
                />
                <PasswordRule
                  text="One number (0–9)"
                  valid={passwordRules.number}
                />
                <PasswordRule
                  text="One special character (!@#...)"
                  valid={passwordRules.special}
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-slate-700">
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
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-sm"
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={
                loading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                !passwordRules.length ||
                !passwordRules.uppercase ||
                !passwordRules.lowercase ||
                !passwordRules.number ||
                !passwordRules.special
              }
              className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
