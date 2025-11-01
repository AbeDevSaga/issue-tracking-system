import { Link, useLocation } from "react-router-dom";

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M3 19c0-3.31 5.82-6 9-6s9 2.69 9 6v2H3z" />
  </svg>
);
const RolesIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="6" r="4" />
    <path d="M3 20c0-4 6-7 9-7s9 3 9 7v1H3z" />
  </svg>
);
const TaskIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 4v16M16 4v16" />
  </svg>
);
const ReportIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 4v16M16 4v16" />
  </svg>
);

export default function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside className="bg-white rounded-[16px] shadow-md border border-[#E2ECEB] flex flex-col min-h-[97vh] max-h-[98vh] w-[230px] p-0 fixed m-4">
      {/* LOGO/HEADER */}
      <div className="flex flex-col items-center pt-4 pb-4 border-b border-gray-100">
        <div className="w-[145px] h-[35px] rounded bg-gray-50 flex items-center justify-center mb-2 border border-[#E2ECEB]">
          {/* logo img placeholder */}
          <img alt="logo" src="/logo.png" className="w-[60px] h-auto" />
        </div>
        <div className="w-[145px] h-[30px] bg-gray-50 mb-2 flex items-center justify-center rounded border border-[#E2ECEB]">
          <span className="text-[11px] text-gray-400 font-semibold">Org Name</span>
        </div>
      </div>
      <nav className="flex-1 flex flex-col py-2 px-0">
        {/* Dashboard */}
        <span className="text-[#6494A4] text-xs font-semibold px-5 mb-1 mt-4">
          Dashboard
        </span>
        <ul className="mb-3">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-5 py-2 rounded-[7px] mt-1
                transition font-medium
                ${isActive("/dashboard") ? "bg-blue-900 text-white shadow-sm" : "text-gray-900 hover:bg-blue-50"}
              `}
            >
              <HomeIcon />
              <span>Dashboard</span>
            </Link>
          </li>
        </ul>
        {/* Management */}
        <ul>
          <li>
            <Link
              to="/users"
              className={`flex items-center gap-2 px-5 py-2 rounded-[7px] mt-1
                transition font-medium
                ${isActive("/users") ? "bg-blue-900 text-white shadow-sm" : "text-gray-900 hover:bg-blue-50"}
              `}
            >
              <UsersIcon />
              <span>Users Management</span>
            </Link>
          </li>
          <li>
            <Link
              to="/roles"
              className={`flex items-center gap-2 px-5 py-2 rounded-[7px] mt-1
                transition font-medium
                ${isActive("/roles") ? "bg-blue-900 text-white shadow-sm" : "text-gray-900 hover:bg-blue-50"}
              `}
            >
              <RolesIcon />
              <span>Roles & Permissions</span>
            </Link>
          </li>
          <li>
            <Link
              to="/tasks"
              className={`flex items-center gap-2 px-5 py-2 rounded-[7px] mt-1
                transition font-medium
                ${isActive("/tasks") ? "bg-blue-900 text-white shadow-sm" : "text-gray-900 hover:bg-blue-50"}
              `}
            >
              <TaskIcon />
              <span>Task Assignment</span>
            </Link>
          </li>
        </ul>
        {/* Report Title */}
        <span className="text-[#6494A4] text-xs font-semibold px-5 mt-6 mb-1">
          Report
        </span>
        <ul>
          <li>
            <Link
              to="/report-list"
              className={`flex items-center gap-2 px-5 py-2 rounded-[7px] mt-1
                transition font-medium
                ${isActive("/report-list") ? "bg-blue-900 text-white shadow-sm" : "text-gray-900 hover:bg-blue-50"}
              `}
            >
              <ReportIcon />
              <span>Report List</span>
            </Link>
          </li>
          <li>
            <Link
              to="/base-data"
              className={`flex items-center gap-2 px-5 py-2 rounded-[7px] mt-1
                transition font-medium
                ${isActive("/base-data") ? "bg-blue-900 text-white shadow-sm" : "text-gray-900 hover:bg-blue-50"}
              `}
            >
              <ReportIcon />
              <span>Base Data</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
