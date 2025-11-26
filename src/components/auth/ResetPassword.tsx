// src/components/auth/ResetPassword.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineSafety,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineCheck,
} from "react-icons/ai";

// Password validation helper
const validatePassword = (password: string) => {
  const validations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isValid = Object.values(validations).every(Boolean);

  return {
    isValid,
    validations,
    errors: Object.entries(validations)
      .filter(([_, isValid]) => !isValid)
      .map(([key]) => key),
  };
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter OTP, 2: Reset Password
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    validations: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
    errors: [],
  });

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize OTP refs
  useEffect(() => {
    otpRefs.current = otpRefs.current.slice(0, 6);
  }, []);

  // Focus first OTP input on mount
  useEffect(() => {
    if (step === 1 && otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

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

  // Validate OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    if (!phoneNumber) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      // Here you would call your OTP verification API
      const response = await fetch("/api/auth/password-reset/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ""),
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("OTP verified successfully");
        setStep(2);
      } else {
        toast.error(data.message || "Invalid OTP");
        // Clear OTP on failure
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 10);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Validate password on change
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({
        isValid: false,
        validations: {
          minLength: false,
          hasUpperCase: false,
          hasLowerCase: false,
          hasNumber: false,
          hasSpecialChar: false,
        },
        errors: [],
      });
    }
  }, [formData.password]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error("Please fix password requirements before submitting");
      return;
    }

    if (otpString.length !== 6) {
      toast.error("OTP is required");
      return;
    }

    if (!phoneNumber) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/sms/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ""),
          otp: otpString,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Password reset successfully! You can now login with your new password."
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Password requirement items
  const passwordRequirements = [
    {
      key: "minLength",
      label: "At least 8 characters long",
      met: passwordValidation.validations.minLength,
    },
    {
      key: "hasUpperCase",
      label: "Contains uppercase letter (A-Z)",
      met: passwordValidation.validations.hasUpperCase,
    },
    {
      key: "hasLowerCase",
      label: "Contains lowercase letter (a-z)",
      met: passwordValidation.validations.hasLowerCase,
    },
    {
      key: "hasNumber",
      label: "Contains number (0-9)",
      met: passwordValidation.validations.hasNumber,
    },
    {
      key: "hasSpecialChar",
      label: "Contains special character (!@#$%^&*)",
      met: passwordValidation.validations.hasSpecialChar,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br bg-[#073954] rounded-2xl flex items-center justify-center shadow-lg">
              <AiOutlineSafety className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {step === 1 ? "Enter OTP" : "Create New Password"}
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              {step === 1
                ? "Enter the 6-digit OTP sent to your phone"
                : "Enter your new password"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
          {/* Step 1: OTP Verification */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Phone Number Display */}
              {phoneNumber && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    OTP sent to: <strong>{phoneNumber}</strong>
                  </p>
                </div>
              )}

              {/* OTP Input - Six Separate Boxes */}
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
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Enter the 6-digit code sent via SMS
                </p>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
                className="w-full bg-[#073954] hover:bg-[#0e577e] disabled:bg-slate-400 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <AiOutlineCheckCircle className="w-6 h-6" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Password Reset */}
          {step === 2 && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <AiOutlineEye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-lg"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <AiOutlineEye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Password Requirements:
                  </p>
                  <div className="space-y-2">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.key}
                        className={`flex items-center gap-3 text-sm ${
                          req.met ? "text-green-600" : "text-slate-600"
                        }`}
                      >
                        {req.met ? (
                          <AiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AiOutlineCloseCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>

                  {passwordValidation.isValid && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium text-center">
                        ✅ Password meets all requirements
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Password Match Indicator */}
              {formData.password && formData.confirmPassword && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium text-center ${
                    formData.password === formData.confirmPassword
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {formData.password === formData.confirmPassword
                    ? "✅ Passwords match"
                    : "❌ Passwords do not match"}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.password ||
                  !formData.confirmPassword ||
                  formData.password !== formData.confirmPassword ||
                  !passwordValidation.isValid
                }
                className="w-full bg-[#073954] hover:bg-[#0e577e] disabled:bg-slate-400 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <AiOutlineSafety className="w-6 h-6" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
