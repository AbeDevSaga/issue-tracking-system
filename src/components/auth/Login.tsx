// src/components/auth/SignInForm.tsx
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";
import Login_bg from "../../assets/login_bg.png";
import { useLoginMutation } from "../../redux/services/authApi";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginMutation] = useLoginMutation();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginMutation(formData).unwrap();

      if (response.token && response.user) {
        setUser(response.user);
        navigate("/dashboard");
      } else {
        setError("Login failed: Invalid credentials");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${Login_bg})` }}
    >
      <div
        className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: "448px", height: "508px" }}
      >
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-4">
            <div className="text-center w-full">
              <img
                src="/logo.jpeg"
                alt="Ethiopian Artificial Intelligence Institute"
                className="h-30 mx-auto mb-1"
              />
              <p className="text-[10px] text-orange-500 uppercase tracking-wide">
                {t("login.title")}
              </p>
            </div>
          </div>

          <div className="w-full mt-3 flex items-center">
            <div className="h-0.5 bg-blue-800 flex-grow"></div>
            <div className="h-0.5 bg-orange-500 w-6 mx-1"></div>
            <div className="h-0.5 bg-blue-800 flex-grow"></div>
          </div>
        </div>

        <div className="p-6 pt-4 space-y-4">
          {/* Email */}
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

          {/* Password */}
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

          {/* Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <a
              href="/forgot-password"
              className="text-red-500 hover:text-red-700 underline"
            >
              {t("login.forgot_password")}
            </a>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 p-2">
              <div className="text-xs text-red-700">{error}</div>
            </div>
          )}

          {/* Submit */}
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
