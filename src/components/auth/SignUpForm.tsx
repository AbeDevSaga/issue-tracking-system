// src/components/auth/SignUpForm.tsx
import { Link } from "react-router-dom";

export default function SignUpForm() {
  return (
    <div className="flex flex-col w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Register your educational institution to get started
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> Individual sign-up is not permitted. 
            Only authorized administrators can register schools through the hierarchical system:
          </p>
          <ul className="mt-2 text-xs list-disc list-inside text-gray-600 dark:text-gray-400">
            <li>Woreda Administrators register schools</li>
            <li>School Administrators register teachers and students</li>
          </ul>
        </div>

        <div className="pt-4 text-center border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you an administrator?{" "}
            <Link to="/admin/register" className="font-medium text-[#269A99] hover:text-[#1d7d7d]">
              Register your institution
            </Link>
          </p>
        </div>

        <div className="pt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-[#269A99] hover:text-[#1d7d7d]">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}