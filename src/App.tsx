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
import Organization from "./pages/organization/organization";
import Inistitutes from "./InternalPages/Organization/organization";
import BunchCreation from "./pages/BunchCreation/organization";
import Branch from "./pages/branch/branch";
import Region from "./pages/region/region";
import Zone from "./pages/zone/zone";
import Login from "./components/auth/Login";
import City from "./pages/city/city";
import SubCity from "./pages/subcity/subcity";
import Project from "./pages/project/project";
import Permission from "./pages/permission/permission";
import Woreda from "./pages/woreda/woreda";
import ProjectLevel from "./pages/priorityLevel/priorityLevel";
import IssueCategory from "./pages/issueCategory/issueCategory";
import MyIssue from "./pages/issue/my_issue";
import IssueFlowConfig from "./pages/IssueFlowConfiguration/IssueFlowConfiguration";
import Roles from "./pages/role/role";
import Subroles from "./pages/subRole/subRole";
// import Users from "./pages/Tables/Users";
import BaseData from "./pages/Basedata/Basedata";
import OrgStructure from "./pages/org_structure/org_structure";
import ProtectedRoute from "./ProtectedRoute";
import MyissueForm from "./pages/issue/my_issue_form";
import QATask from "./pages/QATaskList/QATaskList";
import QATaskDetail from "./pages/QATaskList/QATaskDetail";
import QAExpertTask from "./pages/QAExpertTaskList/QAExpertTaskList";
import QAExpertTaskDetail from "./pages/QAExpertTaskList/QAExpertTaskDetail";
// import TeamLeaderTask from "./pages/TeamLeaderTaskList/TeamLeaderTaskList";
// import TeamLeaderTaskDetail from "./pages/TeamLeaderTaskList/TeamLeaderTaskDetail";
import CentralAdminTaskList from "./pages/CentralAdminTaskList/CentralAdminTaskList";
import CentralAdminTaskDetail from "./pages/CentralAdminTaskList/CentralAdminTaskDetail";
import DeveloperTaskDetail from "./pages/DeveloperTaskList/DeveloperTaskDetail";

import DeveloperTaskList from "./pages/DeveloperTaskList/DeveloperTaskList";
import UserTaskList from "./pages/userTasks/TaskList";
import UserTaskDetail from "./pages/userTasks/TaskDetail";
import IssueDetail from "./pages/issue/issueDetail";
import "./localization";
import Users from "./pages/Users/users";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import ProjectDetail from "./pages/project/ProjectDetail";
import InternalProjectDetail from "./InternalPages/Project/ProjectDetail";
import { Toaster } from "sonner";
import UserDetail from "./pages/Users/userDetail";
import OrganizationDetail from "./pages/organization/organizationDetail";
import InistituteDetail from "./InternalPages/Organization/organizationDetail";
import OrgStructureDetail from "./pages/org_structure/org_structureDetail";
import IssueCategoryDetail from "./pages/issueCategory/issueCategoryDetail";
import CreateRole from "./pages/role/createRole";
import Profile from "./pages/profile/profile";
import PriorityLevelDetail from "./pages/priorityLevel/priorityLevelDetail";
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

          <Route path="/task" element={<UserTaskList />} />
          <Route path="/task/:id" element={<UserTaskDetail />} />
          <Route path="/issue/:id" element={<IssueDetail />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/inistitutes" element={<Inistitutes />} />
          <Route path="/bunch" element={<BunchCreation />} />
          <Route path="/organization/:id" element={<OrganizationDetail />} />
          <Route path="/inistitutes/:id" element={<InistituteDetail />} />
          <Route path="/branch" element={<Branch />} />
          <Route path="/region" element={<Region />} />
          <Route path="/zone" element={<Zone />} />

          <Route path="/city" element={<City />} />
          <Route path="/subcity" element={<SubCity />} />
          <Route path="/woreda" element={<Woreda />} />
          <Route path="/project" element={<Project />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/inistitutes/project/:id" element={<InternalProjectDetail />} />
          <Route path="/priority_level" element={<ProjectLevel />} />
          <Route path="/priority_level/:id" element={<PriorityLevelDetail />} />
          <Route path="/permission" element={<Permission />} />
          <Route path="/role" element={<Roles />} />
          <Route path="/role/:id" element={<CreateRole />} />
          <Route path="/role/create" element={<CreateRole />} />
          <Route path="/issue_category" element={<IssueCategory />} />
          <Route path="/issue_category/:id" element={<IssueCategoryDetail />} />
          <Route path="/my_issue" element={<MyIssue />} />
          <Route path="/issue_configuration" element={<IssueFlowConfig />} />
          {/* IssueFlowConfig */}
          <Route path="/add_issue" element={<MyissueForm />} />
          <Route path="/qa_tasks" element={<QATask />} />
          <Route path="/qa_tasks_detail" element={<QATaskDetail />} />
          <Route path="/tl_tasks" element={<QAExpertTask />} />
          <Route path="/tl_tasks_detail" element={<QAExpertTaskDetail />} />
          <Route
            path="/central_admin_task_list"
            element={<CentralAdminTaskList />}
          />
          <Route
            path="/central_admin_task_detail"
            element={<CentralAdminTaskDetail />}
          />

          <Route path="/developer_tasks" element={<DeveloperTaskList />} />
          <Route
            path="/developer_tasks_detail"
            element={<DeveloperTaskDetail />}
          />
          <Route path="/org_structure" element={<OrgStructure />} />
          <Route path="/org_structure/:id" element={<OrgStructureDetail />} />

          <Route path="/basedata" element={<BaseData />} />
          <Route path="/subroles" element={<Subroles />} />

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
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </Provider>
  );
}
