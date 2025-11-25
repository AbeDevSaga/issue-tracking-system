// src/components/auth/ForgotPassword.tsx
import { useState } from "react";
import { useResetUserPasswordMutation } from "../../redux/services/authApi";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import {
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineArrowLeft,
  AiOutlineSafety,
} from "react-icons/ai";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetPassword, { isLoading }] = useResetUserPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await resetPassword({ email }).unwrap();
      toast.success(
        "If your email exists in our system, you will receive a password reset link shortly.",
        { duration: 6000 }
      );
      // Clear form after successful submission
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      // For security, show the same message regardless of error
      toast.success(
        "If your email exists in our system, you will receive a password reset link shortly.",
        { duration: 6000 }
      );
      setEmail("");
    }
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
              <AiOutlineLock className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Enter your email address and we'll send you a secure link to reset
              your password.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineMail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <AiOutlineSafety className="w-6 h-6" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AiOutlineSafety className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Secure Password Reset
                </p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  You'll receive a secure link via email. The link will expire
                  in 1 hour for your security.
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
