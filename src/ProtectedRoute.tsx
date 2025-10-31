// src/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  anyPermissions?: string[];
  requiredRole?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [],
  anyPermissions = [],
  requiredRole,
  fallbackPath = "/dashboard"
}) => {
  const { user, isAuthenticated, loading, hasPermission, hasAnyPermission, hasRole } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#269A99] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // Check if specific role is required
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if all required permissions are present
  if (requiredPermissions.length > 0 && !requiredPermissions.every(hasPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if any of the specified permissions are present
  if (anyPermissions.length > 0 && !hasAnyPermission(anyPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;