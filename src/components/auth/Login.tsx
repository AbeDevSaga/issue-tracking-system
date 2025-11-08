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
import Login_bg from "../../assets/login_bg.png"
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

    if (error) clearError();
  };

const handleSubmit = async (e: FormEvent): Promise<void> => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("Attempting login with:", formData);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sampleToken = "sample_token_123456789";
    const sampleUser = {
      id: 1,
      name: "John Doe",
      email: "johndoe@example.com",
      role: "admin",
    };

    localStorage.setItem("authToken", sampleToken);
    localStorage.setItem("user", JSON.stringify(sampleUser));

    console.log("Stored mock token and user in localStorage");
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

<div
  className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
  style={{
    backgroundImage: `url(${Login_bg})`,
  }}
>
  <div
    className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
    style={{
      width: "448px",
      height: "508px",
    }}
  >
    <div className="p-6 pb-4">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16">
       
        </div>

        <div className="text-center">
          <img
            src="/logo.jpeg"
            alt="Ethiopian Artificial Intelligence Institute"
            className="h-30 mx-uto mb-1"
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
