// src/components/auth/SignInForm.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex flex-col w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sign in to your  account
        </p>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <Label>Email <span className="text-red-500">*</span></Label>
          <Input placeholder="you@edu.gov.et" />
        </div>

        {/* Password */}
        <div>
          <Label>Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">Keep me signed in</span>
          </div>
          <Link to="/reset-password" className="text-sm text-[#269A99] hover:text-[#1d7d7d]">
            Forgot password?
          </Link>
        </div>

        {/* Sign In Button */}
        <Button className="w-full bg-[#269A99] hover:bg-[#1d7d7d]" size="md">
          Sign In
        </Button>

        {/* Don't have an account? */}
        <div className="pt-4 text-center border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-medium text-[#269A99] hover:text-[#1d7d7d]">
              Register your institution
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}