import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ProfileIcon = () => (
  <svg className="w-8 h-8 rounded-full ring-2 ring-blue-900" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#E7ECF7"/>
    <circle cx="12" cy="10" r="4" fill="#269A99"/>
    <rect x="4" y="16" width="16" height="4" rx="2" fill="#269A99"/>
  </svg>
);

export default function ProfileWidget() {
  const { user, logout } = useAuth() || {};
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-3 px-2 py-0 pr-4 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="User Menu"
      >
        <ProfileIcon />
        <div className="flex flex-col leading-tight text-left">
          <span className="font-bold text-blue-900 text-base">{user?.name || "User Name"}</span>
          <span className="text-xs text-gray-400">{user?.role || user?.user_type || "Role"}</span>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 top-10 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2 px-4 border border-gray-200">
          <div className="flex flex-col gap-1 mb-2">
            <span className="font-bold text-lg text-blue-900">{user?.name || "User Name"}</span>
            <span className="text-sm text-gray-500">{user?.email || "user@email.com"}</span>
            <span className="text-xs text-gray-400">{user?.role || user?.user_type || "Role"}</span>
          </div>
          {/* Add more details as needed */}
          <div className="border-t my-2" />
          <button
            className="w-full text-left px-2 py-1 rounded bg-blue-900 text-white hover:bg-blue-700"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
