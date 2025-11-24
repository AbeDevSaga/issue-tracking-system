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
import { signInSchema, SignInFormData } from "../../utils/validation/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    } = useForm({
    resolver: zodResolver(signInSchema),
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

  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const onSubmit = async (data: SignInFormData) => {
    setError(null);
    try {
    const response = await loginMutation(data).unwrap();
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-4 space-y-4 w-full">
          {/* Email */}
          <div>
            <Label
              htmlFor="email"
              className="block text-base font-medium text-[#0C4A6E] mb-1"
            >
              {t("login.email_phone_number")}
            </Label>
              <Input id="email"  placeholder="example.xx@gov.et" {...register("email")} className={`w-full px-3 py-2 border rounded-md text-sm ${ errors.email ? "border-red-500" : "border-blue-300" }`} /> {errors.email && ( <p className="text-red-500 text-sm mt-1">{errors.email.message}</p> )}
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
                placeholder="enter your password"
                {...register("password")}
                className={`w-full px-3 py-2 pr-10 border rounded-md text-sm ${ errors.password ? "border-red-500" : "border-blue-300" }`}
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
            </div>
            {errors.password && ( <p className="text-red-500 text-sm mt-1">{errors.password.message}</p> )}
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
