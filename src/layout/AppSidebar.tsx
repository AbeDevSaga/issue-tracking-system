// src/components/layout/AppSidebar.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  GroupIcon,
  HorizontaLDots,
  PieChartIcon,
  PlugInIcon
} from "../icons";
import { useAuth } from "./../contexts/AuthContext";
import { PERMISSIONS } from "./../types/auth";
import SidebarWidget from "./SidebarWidget";
import Logo from "../assets/logo.png"

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const BaseDataIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
  </svg>
);
const IssueIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const TaskList = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="9" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="9" y1="18" x2="21" y2="18" />
    <polyline points="3 6 5 8 7 4" />
    <polyline points="3 12 5 14 7 10" />
    <polyline points="3 18 5 20 7 16" />
  </svg>
);

const TaskListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 8 7 4" />
    <polyline points="3 12 5 14 7 10" />
    <polyline points="3 18 5 20 7 16" />

    <line x1="9" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="9" y1="18" x2="21" y2="18" />
  </svg>
);
const LogoIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#269A99"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 6h8" />
    <path d="M8 10h4" />
  </svg>
);

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; permission?: string }[];
  permission?: string;
  anyPermissions?: string[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { hasPermission, hasAnyPermission } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path || location.pathname.startsWith(path + '/'),
    [location.pathname]
  );

  // 📌 PERMISSION-BASED MENU STRUCTURE
const navItems: NavItem[] = [
  {
    icon: <HomeIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },

  {
    icon: <GroupIcon />,
    name: "User Management",
    path: "/users"
    //permission: PERMISSIONS.USER_READ,
    // subItems: [
    //   { 
    //     name: "Role & Permissions ", 
    //     path: "/roles", 
    //    // permission: PERMISSIONS.ROLE_READ 
    //   },
      
    //   { 
    //     name: " Users", 
    //     path: "/users", 
    //   //  permission: PERMISSIONS.USER_READ 
    //   },
    // ],
  },

  {
    icon: <BaseDataIcon />,
    name: "BaseData",
    path: "/basedata",
  },
  
  {
    icon: <IssueIcon />,
    name: "My Issue",
    path: "/my_issue",
  },
   {
    icon: <TaskList />,
    name: "Central Admin Task List",
    path: "/central_admin_task_list",
  },
  {
    icon: <TaskList />,
    name: "QA Leader Task List",
    path: "/qa_tasks", 
  },
    {
    icon: <TaskList />,
    name: "QA Expert Task List",
    path: "/tl_tasks", 
  },
  {
    icon: <TaskList />,
    name: "Developer Task List",
    path: "/developer_tasks", 
  },

];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Reports & Analytics",
    anyPermissions: [PERMISSIONS.REPORTS, PERMISSIONS.AUDIT_LOGS_VIEW],
    subItems: [
      { 
        name: "Reports", 
        path: "/financial", 
        permission: PERMISSIONS.FINANCIAL_REPORTS 
      },
     
    
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "System Settings",
    subItems: [
      { name: "Profile", path: "/profile" },
     
   
    
    ],
  },

];

  // Filter menu items based on permissions
  const filterMenuItems = (items: NavItem[]) => {
    return items.filter(item => {
      // Check main item permission
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }
      if (item.anyPermissions && !hasAnyPermission(item.anyPermissions)) {
        return false;
      }

      // Filter subitems
      if (item.subItems) {
        item.subItems = item.subItems.filter(subItem => {
          if (subItem.permission && !hasPermission(subItem.permission)) {
            return false;
          }
          return true;
        });

        // Remove main item if no subitems remain
        if (item.subItems.length === 0) {
          return false;
        }
      }

      return true;
    });
  };

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    const filteredItems = filterMenuItems(items);
    
    if (filteredItems.length === 0) return null;

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size  ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
               <ul className="relative mt-2 ml-5">
  <span className="absolute left-0 top-0 w-[2px] h-full bg-gray-300 dark:bg-gray-600"></span>

  {nav.subItems.map((subItem, idx) => (
    <li key={subItem.name} className="relative pl-4">
      <Link
        to={subItem.path}
        className={`menu-dropdown-item block ${
          isActive(subItem.path)
            ? "menu-dropdown-item-active"
            : "menu-dropdown-item-inactive"
        }`}
      >
        {subItem.name}
      </Link>
    </li>
  ))}
</ul>

              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside
      // className={`fixed mt-16 flex flex-col lg:mt-10 top-0 px-5 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800
       className={`fixed mt-16 flex flex-col lg:mt-10 top-0 px-5 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800 rounded-r-2xl

        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

   <div
  className={`py-2 flex flex-col mb-4 ${
    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
  } border-b border-gray-300`}
>
  <Link
    to="/"
    className="flex flex-col items-center justify-center group p-2"
  >
      {isExpanded || isHovered || isMobileOpen ? (<>
       <img
      src={Logo}
      alt="Logo"
      className={isExpanded || isHovered || isMobileOpen ? "w-40" : "w-12"}
    />
  <h2 className="mt-2 text-xs uppercase text-center leading-[20px] text-[#094C81] dark:text-[#094C81] font-bold">
  የኢትዮጵያ አርቴፊሻል ኢንተለጀንስ ተቋም
</h2>
<h2 className="text-xs uppercase text-center leading-[20px] text-[#094C81] dark:text-[#094C81] font-bold">
  Ethiopian Artificial Intelligence
</h2>
</>):(<> 
<img
      src={Logo}
      alt="Logo"
      className={isExpanded || isHovered || isMobileOpen ? "w-40" : "w-12"}
    />
  
</>)}
   
  </Link>

</div>


      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-[#094C81] dark:text-gray-500 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6 text-gray-400 dark:text-gray-500" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 dark:text-gray-500 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Administration"
                ) : (
                  <HorizontaLDots className="size-6 text-gray-400 dark:text-gray-500" />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;