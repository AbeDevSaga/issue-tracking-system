import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { AiOutlineLock, AiOutlineArrowLeft } from "react-icons/ai";

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
  const location = useLocation();
  const email = (location.state as any)?.email || "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password rules state
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Live password validation
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
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
      const API_BASE_URL =process.env.VITE_API_URL||'http://196.188.240.103:4038';
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // send JWT
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Password changed successfully!");
        setTimeout(() => navigate("/dashboard"), 1500);
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
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                disabled={loading}
                className="block w-full pl-3 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-sm"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-slate-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={loading}
                className="block w-full pl-3 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-sm"
              />
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
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
                className="block w-full pl-3 pr-4 py-3.5 border border-slate-300 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 text-slate-900 text-sm"
              />
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
