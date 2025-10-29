// src/App.tsx
import type { ReactNode } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";

import Login from "./components/auth/Login";
import Roles from "./pages/Tables/Roles";
import Users from "./pages/Tables/Users";
import ProtectedRoute from "./ProtectedRoute";

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


                    <Route
            path="/users"
            element={
              
                <Users />
             
            }
          />




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
          path="/"
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