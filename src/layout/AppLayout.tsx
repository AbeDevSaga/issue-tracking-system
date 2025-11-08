// src/layout/AppLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

const LayoutWithSidebar: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const LayoutWithoutSidebar: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <Outlet />
      </div>
    </div>
  );
};

const LayoutContent: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#269A99] border-r-transparent"></div>
      </div>
    );
  }

  const isStudent = user?.user_type === "student";

  const studentRoutes = [
    "/student-dashboard",
    "/all-courses",
    "/my-courses",
    "/student-exam",
    "/student-resources",
  ];

  const isStudentRoute = studentRoutes.includes(location.pathname);

  if (!isStudent || !isStudentRoute) {
    return (
      <SidebarProvider>
        <LayoutWithSidebar />
      </SidebarProvider>
    );
  }

  return <LayoutWithoutSidebar />;
};

const AppLayout: React.FC = () => {
  return <LayoutContent />;
};

export default AppLayout;
