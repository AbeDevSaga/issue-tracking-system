import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../context/SidebarContext";

// --- PROFILE WIDGET INLINE ---
const ProfileIcon = () => (
  <svg className="w-8 h-8 rounded-full ring-2 ring-blue-900" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#E7ECF7"/>
    <circle cx="12" cy="10" r="4" fill="#269A99"/>
    <rect x="4" y="16" width="16" height="4" rx="2" fill="#269A99"/>
  </svg>
);

function ProfileWidget({ user }) {
  const { logout } = useAuth() || {};
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    function handle(e) {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [open]);

  function handleLogout() {
    if (logout) logout();
    navigate("/");
  }

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
          <span className="text-xs text-gray-400">{user?.role || user?.user_type || "Center admin"}</span>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 top-10 mt-1 w-56 bg-white rounded-lg shadow-xl z-50 py-2 px-4 border border-gray-200">
          <div className="flex flex-col gap-1 mb-2">
            <span className="font-bold text-lg text-blue-900">{user?.name || "User Name"}</span>
            <span className="text-sm text-gray-500">{user?.email || "user@email.com"}</span>
            <span className="text-xs text-gray-400">{user?.role || user?.user_type || "Role"}</span>
          </div>
          {/* Add more details as needed */}
          <div className="border-t my-2" />
          <button
            className="w-full text-left px-2 py-1 rounded bg-blue-900 text-white hover:bg-blue-700"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
// --- END PROFILE WIDGET ---

// --- LANGUAGE SWITCHER ---
const LANGUAGES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "am", label: "Amharic", flag: "አማ" }
];

function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (open && btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={btnRef}>
      <button
        className="flex items-center px-3 py-2 rounded-lg border hover:bg-blue-50 text-blue-900 font-medium shadow cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mr-1">{LANGUAGES.find(l => l.code === lang)?.flag || "EN"}</span>
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg border z-50 py-1">
          {LANGUAGES.map(l => (
            <button
              className={`w-full text-left px-4 py-2 hover:bg-blue-100 ${lang === l.code ? "font-bold text-blue-800" : ""}`}
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
            >
              {l.flag} <span className="ml-1">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// --- END LANGUAGE SWITCHER ---

const translations = {
  en: {
    search: "Search... (Ctrl+K)"
  },
  am: {
    search: "ፈልግ... (Ctrl+K)"
  }
};

const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { user } = useAuth();
  const isStudent = user?.user_type === 'student';

  let isMobileOpen = false;
  let toggleSidebar = () => {};
  let toggleMobileSidebar = () => {};
  try {
    const sb = useSidebar();
    if (sb) {
      isMobileOpen = sb.isMobileOpen ?? false;
      toggleSidebar = sb.toggleSidebar ?? (() => {});
      toggleMobileSidebar = sb.toggleMobileSidebar ?? (() => {});
    }
  } catch (e) {}

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef(null);

  // --- LANGUAGE SWITCHER HOOK ---
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-40 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* HAMBURGER MENU BUTTON REMOVED! */}

          <Link to="/" className="lg:hidden">
            <img className="dark:hidden" src="logo" alt="Logo" />
            <img className="hidden dark:block" src="logo" alt="Logo" />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-40 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z" fill="currentColor" />
            </svg>
          </button>

          <div className="hidden lg:block flex-1 max-w-md ml-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={translations[lang].search}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        
        <div className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}>
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
          {/* ---- PROFILE WIDGET ADDED HERE ---- */}
          <ProfileWidget user={user} />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
