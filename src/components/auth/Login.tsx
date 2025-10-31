// src/components/auth/SignInForm.tsx
import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const { login, error, clearError, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) clearError();
  };

const handleSubmit = async (e: FormEvent): Promise<void> => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("Attempting login with:", formData);

    // 🔹 Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 🔹 Mock token and user
    const sampleToken = "sample_token_123456789";
    const sampleUser = {
      id: 1,
      name: "John Doe",
      email: "johndoe@example.com",
      role: "admin",
    };

    // 🔹 Save mock data to localStorage
    localStorage.setItem("authToken", sampleToken);
    localStorage.setItem("user", JSON.stringify(sampleUser));

    console.log("Stored mock token and user in localStorage");

    // 🔹 Mock updating auth context/state (if you have one)
    // setUser(sampleUser);
    // setIsAuthenticated(true);

    // 🔹 Check if tokens are stored
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    console.log("Stored token:", storedToken ? "YES" : "NO");
    console.log("Stored user:", storedUser ? "YES" : "NO");

    setTimeout(() => {
      console.log("Navigating to dashboard...");
      navigate("/dashboard");
    }, 500);
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section with bg.jpg */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-4">
            {/* Left Orange Molecule Design */}
            <div className="w-16 h-16">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 0L75 14.43L75 42.86L50 57.29L25 42.86L25 14.43L50 0Z"
                  fill="#FF9A00"
                />
                <path
                  d="M50 57.29L75 71.72L75 100L50 114.43L25 100L25 71.72L50 57.29Z"
                  fill="#FF9A00"
                />
                <path
                  d="M75 14.43L100 28.86L100 57.29L75 71.72L50 57.29L50 28.86L75 14.43Z"
                  fill="#FF9A00"
                />
                <path
                  d="M25 14.43L0 28.86L0 57.29L25 71.72L50 57.29L50 28.86L25 14.43Z"
                  fill="#FF9A00"
                />
                <circle cx="50" cy="28.86" r="3" fill="#FF9A00" />
                <circle cx="50" cy="71.72" r="3" fill="#FF9A00" />
                <circle cx="75" cy="42.86" r="3" fill="#FF9A00" />
                <circle cx="25" cy="42.86" r="3" fill="#FF9A00" />
                <circle cx="100" cy="57.29" r="3" fill="#FF9A00" />
                <circle cx="0" cy="57.29" r="3" fill="#FF9A00" />
              </svg>
            </div>

            {/* Center Logo and Text */}
            <div className="text-center">
              <img
                src="/logo.jpeg"
                alt="Ethiopian Artificial Intelligence Institute"
                className="h-12 mx-auto mb-1"
              />

              <p className="text-[10px] text-orange-500 uppercase tracking-wide">
                {t("login.title")}
              </p>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full mt-3 flex items-center">
            <div className="h-0.5 bg-blue-800 flex-grow"></div>
            <div className="h-0.5 bg-orange-500 w-6 mx-1"></div>
            <div className="h-0.5 bg-blue-800 flex-grow"></div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-4 space-y-4">
          {/* Email Input */}
          <div>
            <Label
              htmlFor="email"
              className="block text-xs font-medium text-blue-800 mb-1"
            >
              {t("login.email_phone_number")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="example.xx@gov.et"
            />
          </div>

          {/* Password Input */}
          <div>
            <Label
              htmlFor="password"
              className="block text-xs font-medium text-blue-800 mb-1"
            >
              {t("login.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-blue-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeCloseIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Checkbox
                id="remember-me"
                name="remember-me"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="remember-me" className="ml-2 text-gray-900">
                {t("login.remember_me")}
              </Label>
            </div>
            <a
              href="/forgot-password"
              className="text-red-500 hover:text-red-700 underline"
            >
              {t("login.forgot_password")}
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-2">
              <div className="text-xs text-red-700">{error}</div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
             bg-[#0C4A6E] hover:bg-[#083b56] focus:outline-none focus:ring-2 focus:ring-offset-2 
             focus:ring-[#0C4A6E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("login.Signing_in") : t("login.login")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
