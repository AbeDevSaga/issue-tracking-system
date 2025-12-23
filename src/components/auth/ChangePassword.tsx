import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AiOutlineLock } from "react-icons/ai";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { useAuth } from "../../contexts/AuthContext";

// Component to display password rules
const PasswordRule = ({ text, valid }: { text: string; valid: boolean }) => (
  <div className="flex items-center gap-2 text-sm">
    {valid ? (
      <span className="text-green-600 font-bold">✔</span>
    ) : (
      <span className="text-slate-400 font-bold">✖</span>
    )}
    <span className={valid ? "text-green-700" : "text-slate-500"}>{text}</span>
  </div>
);

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFirstTime = user?.is_first_logged_in ?? false;
  const [allowRedirect, setAllowRedirect] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password rules
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

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

  useEffect(() => {
    if (!isFirstTime) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!allowRedirect) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (!allowRedirect) navigate("/change_password", { replace: true });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFirstTime, navigate, allowRedirect]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) return toast.error("Current password is required");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");
    if (
      !passwordRules.length ||
      !passwordRules.uppercase ||
      !passwordRules.lowercase ||
      !passwordRules.number ||
      !passwordRules.special
    ) {
      return toast.error("Password does not meet requirements");
    }

    setLoading(true);
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_PUBLIC_BASE_URL || "http://localhost:4000";

      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Password changed successfully. Please login again.");
        setAllowRedirect(true);
        localStorage.clear();
        setTimeout(() => (window.location.href = "/login"), 800);
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    placeholder: string
  ) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required
        disabled={loading}
        className="block w-full pl-3 pr-10 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-500 hover:text-slate-700"
      >
        {show ? (
          <AiOutlineEyeInvisible className="w-5 h-5" />
        ) : (
          <AiOutlineEye className="w-5 h-5" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <AiOutlineLock className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Change Your Password
            </h1>
            <p className="text-slate-600 text-2xl leading-relaxed">
              Enter your current and new password to continue
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6">
          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-slate-700">
                Current Password
              </label>
              {renderPasswordInput(
                currentPassword,
                setCurrentPassword,
                showCurrent,
                setShowCurrent,
                "Enter current password"
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-slate-700">
                New Password
              </label>
              {renderPasswordInput(
                newPassword,
                setNewPassword,
                showNew,
                setShowNew,
                "Enter new password"
              )}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-slate-700">
                Confirm Password
              </label>
              {renderPasswordInput(
                confirmPassword,
                setConfirmPassword,
                showConfirm,
                setShowConfirm,
                "Confirm new password"
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !currentPassword ||
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
              {loading ? "Updating Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
