// src/components/common/PermissionGuard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  requiredRole?: string;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  anyPermissions = [],
  allPermissions = [],
  requiredRole,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check role first if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check any permissions
  if (anyPermissions.length > 0 && !hasAnyPermission(anyPermissions)) {
    return <>{fallback}</>;
  }

  // Check all permissions
  if (allPermissions.length > 0 && !hasAllPermissions(allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;