// src/components/auth/SignInForm.tsx
import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useLoginMutation } from "../../redux/services/authApi";

interface FormData {
  email: string;
  password: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const result = await login(formData).unwrap(); // unwrap to catch errors
      console.log("Login result:", result);

      // Navigate after login
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err?.data?.message || err.message);
    }
  };

  // Get stored user from localStorage for debug/info
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="flex flex-col w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sign in to your LINK CARE account
        </p>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 text-xs">
        <div>User: {user ? user.full_name : "None"}</div>
        <div>Authenticated: {user ? "YES" : "NO"}</div>
        <div>Loading: {isLoading ? "YES" : "NO"}</div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {(error as any).data?.message || "Login failed"}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <Label htmlFor="email">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="Enter your username"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeIcon className="size-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <EyeCloseIcon className="size-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
              Keep me signed in
            </span>
          </div>
          <Link
            to="/reset-password"
            className="text-sm text-[#269A99] hover:text-[#1d7d7d]"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          className="w-full bg-[#269A99] hover:bg-[#1d7d7d] disabled:opacity-50"
          size="md"
          disabled={isLoading || !formData.email || !formData.password}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>

        {/* Don't have an account? */}
        <div className="pt-4 text-center border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-[#269A99] hover:text-[#1d7d7d]"
            >
              Create one
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
