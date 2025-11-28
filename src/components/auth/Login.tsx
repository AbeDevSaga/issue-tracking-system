// src/components/auth/SignInForm.tsx
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";
import Login_bg from "../../assets/login_bg.png";
import { useLoginMutation } from "../../redux/services/authApi";
import { EyeOffIcon } from "lucide-react";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import {
  signInSchema,
  SignInFormData,
} from "../../utils/validation/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

interface FormData {
  email: string;
  phoneNumber: string;
  password: string;
}

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginMutation] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    resetField,
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      navigate("/dashboard");
    }
  }, [navigate]);

  // Format Ethiopian phone number for display
  const formatEthiopianPhoneNumber = (value: string) => {
    if (!value) return value;

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

  const handlePhoneNumberChange = (value: string) => {
    const formattedValue = formatEthiopianPhoneNumber(value);
    return formattedValue;
  };

  const handleLoginMethodChange = (method: "email" | "phone") => {
    setLoginMethod(method);
    // Clear both fields when switching methods
    setValue("email", "");
    setValue("phoneNumber", "");
    setError(null);
  };

  const onSubmit = async (data: any) => {
    setError(null);
    try {
      let loginData;

      if (loginMethod === "email") {
        loginData = {
          email: data.email,
          password: data.password,
        };
      } else {
        // Clean phone number for API (remove formatting)
        const cleanPhoneNumber = data.phoneNumber.replace(/\D/g, "");
        loginData = {
          phoneNumber: cleanPhoneNumber,
          password: data.password,
        };
      }

      const response = await loginMutation(loginData).unwrap();
      if (response.token && response.user) {
        navigate("/dashboard");
      } else {
        setError("Login failed: Invalid credentials");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${Login_bg})` }}
    >
      <div className="relative w-full max-w-md min-h-[550px] flex flex-col justify-center items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 pb-4 w-full ">
          <div className="flex items-center justify-center gap-4 flex-col space-x-4">
            <div className="text-center w-full flex justify-center items-center gap-2 flex-col">
              <img
                src="/logo.jpeg"
                alt="Ethiopian Artificial Intelligence Institute"
                className="h-30 mx-auto mb-1"
              />
              <p className="text-[12px] text-[#0C4A6E] font-bold text-center uppercase tracking-wide">
                {t("login.title")}
              </p>
            </div>
            {/* Error */}
            {error && (
              <div className="rounded-md  w-full text-center ">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Login Method Toggle */}
        <div className="w-full px-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleLoginMethodChange("email")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                loginMethod === "email"
                  ? "bg-white text-[#0C4A6E] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("Login by Email")}
            </button>
            <button
              type="button"
              onClick={() => handleLoginMethodChange("phone")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                loginMethod === "phone"
                  ? "bg-white text-[#0C4A6E] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("Login Phone")}
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 pt-4 space-y-4 w-full"
        >
          {/* Email or Phone Input */}
          <div>
            <Label
              htmlFor={loginMethod === "email" ? "email" : "phoneNumber"}
              className="block text-base font-medium text-[#0C4A6E] mb-1"
            >
              {loginMethod === "email"
                ? t("Login Email")
                : t("ogin.phone_number")}
            </Label>

            {loginMethod === "email" ? (
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      id="email"
                      placeholder="example.xx@gov.et"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setValue("phoneNumber", ""); // Clear phone when using email
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${
                        errors.email ? "border-red-500" : "border-blue-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </>
                )}
              />
            ) : (
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      id="phoneNumber"
                      placeholder="9-123-456-789"
                      value={field.value}
                      onChange={(e) => {
                        const formattedValue = handlePhoneNumberChange(
                          e.target.value
                        );
                        field.onChange(formattedValue);
                        setValue("email", ""); // Clear email when using phone
                      }}
                      maxLength={14}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "border-blue-300"
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t("login.phone_format")}
                    </p>
                  </>
                )}
              />
            )}
          </div>

          {/* Password */}
          <div>
            <Label
              htmlFor="password"
              className="block text-base font-medium text-[#0C4A6E] mb-1"
            >
              {t("login.password")}
            </Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="enter your password"
                    value={field.value}
                    onChange={field.onChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-md text-sm ${
                      errors.password ? "border-red-500" : "border-blue-300"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 -translate-y-1/2 inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOpenIcon className="h-5 w-5 text-[#0C4A6E]" />
                    ) : (
                      <EyeOffIcon className="h-5 w-5 text-[#0C4A6E]" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Forgot Password */}
          <div className="flex items-center w-full text-right justify-end text-sm">
            <Link
              to="/forgot-password"
              className="text-[#0C4A6E] hover:text-[#083b56]  hover:font-medium hover:cursor-pointer "
            >
              {t("login.forgot_password")}
            </Link>
          </div>

          {/* Submit */}
          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
               bg-[#0C4A6E] hover:bg-[#083b56] focus:outline-none focus:ring-2 focus:ring-offset-2 
               focus:ring-[#0C4A6E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("login.Signing_in") : t("login.login")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
