// src/App.tsx
import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";
import Organization from"./pages/organization/organization"
import Branch from"./pages/branch/branch"
import Region from"./pages/region/region"
import Zone from"./pages/zone/zone"
import Login from "./components/auth/Login";
import City from './pages/city/city'
import SubCity from './pages/subcity/subcity'
import Project from './pages/project/project'
import Woreda from './pages/woreda/woreda'
import ProjectLevel from './pages/priorityLevel/priorityLevel'
import IssueCategory from './pages/issueCategory/issueCategory'
import MyIssue from './pages/issue/my_issue'
import Roles from "./pages/Tables/Roles";
// import Users from "./pages/Tables/Users";
import BaseData from "./pages/Basedata/Basedata";
import OrgStructure from "./pages/org_structure/org_structure"
import ProtectedRoute from "./ProtectedRoute";
import MyissueForm from "./pages/issue/my_issue_form";
import QATask from "./pages/QATaskList/QATaskList"
import QATaskDetail from "./pages/QATaskList/QATaskDetail"
import TeamLeaderTask from "./pages/TeamLeaderTaskList/TeamLeaderTaskList";
import TeamLeaderTaskDetail from "./pages/TeamLeaderTaskList/TeamLeaderTaskDetail";
import CentralAdminTaskList from "./pages/CentralAdminTaskList/CentralAdminTaskList"
import CentralAdminTaskDetail from "./pages/CentralAdminTaskList/CentralAdminTaskDetail"

import DeveloperTaskList from "./pages/DeveloperTaskList/DeveloperTaskList"
import "./localization";
import Users from "./pages/Users/users"
const AuthLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <AuthLoader />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermissions={['user_read']}>
                <Users />
              </ProtectedRoute>
            }
          /> */}

          <Route path="/users" element={<Users />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/branch" element={<Branch />} />
          <Route path="/region" element={<Region />} />
          <Route path="/zone" element={<Zone />} />
          
          <Route path="/city" element={<City />} />
          <Route path="/subcity" element={<SubCity />} />
          <Route path="/woreda" element={<Woreda />} />
          <Route path="/project" element={<Project />} />
          <Route path="/priority_level" element={<ProjectLevel />} />
          <Route path="/issue_category" element={<IssueCategory />} />
          <Route path="/my_issue" element={<MyIssue />} />
          <Route path="/add_issue" element={<MyissueForm />} />
          <Route path="/qa_tasks" element={<QATask />} />
          <Route path="/qa_tasks_detail" element={<QATaskDetail />} />
          <Route path="/tl_tasks" element={<TeamLeaderTask />} />
          <Route path="/tl_tasks_detail" element={<TeamLeaderTaskDetail />} />
          <Route path="/central_admin_task_list" element={<CentralAdminTaskList />} />
          <Route path="/central_admin_task_detail" element={<CentralAdminTaskDetail/>} />
          
          <Route path="/developer_tasks" element={<DeveloperTaskList />} />
          <Route path="/org_structure" element={<OrgStructure />} />
          

          <Route path="/basedata" element={<BaseData />} />

          <Route
            path="/roles"
            element={
              //<ProtectedRoute requiredPermissions={['role_read']}>
              <Roles />
              //</ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
