// src/components/auth/ResetPassword.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  useValidateResetTokenQuery,
  useConfirmPasswordResetMutation,
} from "../../redux/services/authApi";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);

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

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // RTK Query hooks
  const {
    data: validationData,
    error: validationError,
    isLoading: isValidating,
  } = useValidateResetTokenQuery(
    { token: token!, email: email! },
    {
      skip: !token || !email,
    }
  );

  const [confirmPasswordReset, { isLoading: isSubmitting }] =
    useConfirmPasswordResetMutation();

  // Handle token validation
  useEffect(() => {
    console.log("🔍 ResetPassword Component Mounted");
    console.log("📧 Email from URL:", email);
    console.log("🔑 Token from URL:", token);

    if (!token || !email) {
      console.error("❌ Missing token or email in URL");
      toast.error("Invalid reset link - missing parameters");
      navigate("/forgot-password");
      return;
    }
  }, [token, email, navigate]);

  // Handle validation response
  useEffect(() => {
    if (validationData) {
      console.log("📄 Validation response data:", validationData);

      if (validationData.success && validationData.valid) {
        console.log("🎉 Token is valid!");
        setTokenValid(true);
        toast.success(
          "Reset link is valid. You can now set your new password."
        );
      } else {
        console.log("❌ Token validation failed:", validationData.message);
        toast.error(
          validationData.message || "This reset link is invalid or has expired"
        );
        navigate("/forgot-password");
      }
      setValidating(false);
    }

    if (validationError) {
      console.error("Token validation error:", validationError);
      toast.error("Error validating reset link. Please try again.");
      navigate("/forgot-password");
      setValidating(false);
    }
  }, [validationData, validationError, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenValid) {
      toast.error("Invalid reset token");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error("Please fix password requirements before submitting");
      return;
    }

    try {
      console.log("📡 Submitting new password...");
      const result = await confirmPasswordReset({
        token: token!,
        email: email!,
        newPassword: formData.password,
      }).unwrap();

      console.log("Password reset response:", result);

      if (result.success) {
        toast.success(
          "Password reset successfully! You can now login with your new password."
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error(" Password reset error:", error);
      toast.error(
        error.data?.message || error.message || "Error resetting password"
      );
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

  // Loading state
  if (validating || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Validating Reset Link
            </h3>
            <p className="text-slate-600 mb-2">
              Please wait while we verify your reset link...
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Token: {token ? "✅ Present" : "❌ Missing"}</p>
              <p>Email: {email ? "✅ Present" : "❌ Missing"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If token is invalid, this will redirect in useEffect
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to forgot password page...</p>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div
              className="w-20 h-20 bg-gradient-to-br bg-[#073954]
 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <AiOutlineCheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Create New Password
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Enter your new password for <strong>{email}</strong>
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                isSubmitting ||
                !formData.password ||
                !formData.confirmPassword ||
                formData.password !== formData.confirmPassword ||
                !passwordValidation.isValid
              }
              className="w-full bg-gradient-to-r bg-[#073954]
 hover:bg-[#0e577e]
 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
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
        </div>
      </div>
    </div>
  );
}
