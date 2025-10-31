import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Avater from "../../assets/avater.jpg"
export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, token, logout } = useAuth();

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="block mr-1 font-medium text-theme-sm">{user.name}</span>

        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src={user.photo || Avater} alt="User" />
        </span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user.name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            Role: {user.user_type}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 break-all">
            Token: {token}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => {
                logout();
                closeDropdown();
              }}
              tag="button"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Sign out
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
