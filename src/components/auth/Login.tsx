// src/components/auth/SignInForm.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";
import Login_bg from "../../assets/login_bg.png";
import { ArrowLeftIcon, EyeOffIcon } from "lucide-react";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import {
  signInSchema,
  SignInFormData,
} from "../../utils/validation/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (data: SignInFormData) => {
    clearError();

    const payload: { email?: string; phoneNumber?: string; password: string } =
      {
        password: data.password,
      };

    // Detect if identifier is email or phone
    const identifier = data.identifier.trim();
    if (identifier.includes("@")) {
      payload.email = identifier;
    } else {
      // Use phone exactly as entered (matches registered format)
      payload.phoneNumber = identifier;
    }

    try {
      const response = await login(payload);

      if (response.user.is_first_logged_in) {
        navigate("/change_password", {
          replace: true,
          state: { firstTime: true },
        });
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${Login_bg})` }}
    >
      <Button
        onClick={() => navigate("/")}
        className="cursor-pointer z-50 bg-white/95 hover:bg-slate-100 backdrop-blur-md rounded-2xl shadow-2xl p-2 top-4 left-4 absolute flex items-center gap-1"
      >
        <ArrowLeftIcon className="w-5 h-5 text-[#0C4A6E]" />
        <span className="text-sm text-[#0C4A6E] font-medium">Back</span>
      </Button>

      <div className="relative w-full max-w-md min-h-[550px] flex flex-col justify-center items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 pb-4 w-full text-center">
          <img
            src="/logo.jpeg"
            alt="Ethiopian Artificial Intelligence Institute"
            className="h-30 mx-auto mb-1"
          />
          <p className="text-[12px] text-[#0C4A6E] font-bold uppercase tracking-wide">
            <span className="text-sm">{t("login.title_am")}</span>
            <span className="text-[12px]">{t("login.title")}</span>
          </p>

          {(authError || errors.root) && (
            <div className="rounded-md w-full text-center mt-2">
              <div className="text-sm text-red-700">
                {authError || errors.root?.message}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 pt-4 space-y-4 w-full"
        >
          {/* Identifier */}
          <div>
            <Label
              htmlFor="identifier"
              className="block text-base font-medium text-[#0C4A6E] mb-1"
            >
              Email or Phone
            </Label>
            <Input
              id="identifier"
              placeholder="Enter your email or phone"
              {...register("identifier")}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.identifier ? "border-red-500" : "border-blue-300"
              }`}
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1">
                {errors.identifier.message}
              </p>
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={`w-full px-3 py-2 pr-10 border rounded-md text-sm ${
                  errors.password ? "border-red-500" : "border-blue-300"
                }`}
              />
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOpenIcon className="h-5 w-5 text-[#0C4A6E]" />
                ) : (
                  <EyeOffIcon className="h-5 w-5 text-[#0C4A6E]" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex items-center w-full justify-end text-sm">
            <Link
              to="/forgot-password"
              className="text-[#0C4A6E] hover:text-[#083b56] hover:font-medium"
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
                bg-[#0C4A6E] hover:bg-[#083b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C4A6E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("login.Signing_in") : t("login.login")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
