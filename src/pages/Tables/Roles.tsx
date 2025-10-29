// src/pages/RoleManagement.tsx
import { useState } from 'react';
import PageMeta from "../../components/common/PageMeta";
import RoleListTable from "../../components/tables/BasicTables/RoleListTable";
import { useAuth } from "../../contexts/AuthContext";
import { PERMISSIONS } from "../../types/auth";

export default function Roles() {
  const { hasPermission } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Permission checks
  const canViewRoles = hasPermission(PERMISSIONS.ROLE_READ);
  const canCreateRoles = hasPermission(PERMISSIONS.ROLE_CREATE);
  const canUpdateRoles = hasPermission(PERMISSIONS.ROLE_UPDATE);
  const canDeleteRoles = hasPermission(PERMISSIONS.ROLE_DELETE);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // If user doesn't have view permission, show access denied
  if (!canViewRoles) {
    return (
      <>
        <PageMeta
          title="Role Management - Access Denied"
          description="You don't have permission to access role management"
        />
        <div className="space-y-1">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-red-800">Access Denied</h2>
            <p className="mt-2 text-red-600">You don't have permission to view roles.</p>
            <p className="mt-1 text-sm text-red-500">
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Role Management"
        description="Manage system roles and permissions"
      />
    
      <div className="space-y-1">
        <RoleListTable 
          key={refreshKey}
          onRefresh={handleRefresh}
          canCreate={canCreateRoles}
          canUpdate={canUpdateRoles}
          canDelete={canDeleteRoles}
        />
      </div>
    </>
  );
}