// src/components/roles/PermissionModal.tsx
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import Button from "../../ui/button/Button";
import { Role } from "./RoleListTable";
import { useTranslation } from "react-i18next";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSave: () => void;
}

interface ApiPermission {
  permission_id: string;
  permission_name: string;
  permission_description: string;
  module: string;
  permission_group: string;
  created_at: string;
}

interface GroupedPermissions {
  [module: string]: {
    [group: string]: ApiPermission[];
  };
}

export default function PermissionModal({
  isOpen,
  onClose,
  role,
  onSave,
}: PermissionModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<ApiPermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const { t } = useTranslation();

  // Get role ID safely - handle both role_id and id properties
  const getRoleId = () => {
    if (!role) return null;
    return role.role_id || role.id;
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const res = await api.get("/permissions");
        const permissions = res.data.data?.permissions || [];
        setAvailablePermissions(permissions);

        const grouped = permissions.reduce((acc: GroupedPermissions, permission: ApiPermission) => {
          const module = permission.module || 'Other';
          const group = permission.permission_group || 'General';
          if (!acc[module]) acc[module] = {};
          if (!acc[module][group]) acc[module][group] = [];
          acc[module][group].push(permission);
          return acc;
        }, {});
        setGroupedPermissions(grouped);
      } catch (err) {
        console.error("Failed to fetch permissions", err);
        alert("Failed to load permissions");
      } finally {
        setPermissionsLoading(false);
      }
    };
    if (isOpen) fetchPermissions();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && role) {
      const rolePermissions = role.permissions || [];
      const rolePermissionIds = rolePermissions.map(p => p.permission_id || p.permissionId);
      setSelectedPermissions(new Set(rolePermissionIds));
    }
  }, [isOpen, role]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      newSet.has(permissionId) ? newSet.delete(permissionId) : newSet.add(permissionId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedPermissions(prev => prev.size === availablePermissions.length
      ? new Set()
      : new Set(availablePermissions.map(p => p.permission_id))
    );
  };

  const handleSelectModule = (module: string) => {
    const modulePermissions = Object.values(groupedPermissions[module] || {}).flat();
    const modulePermissionIds = modulePermissions.map(p => p.permission_id);
    const allModuleSelected = modulePermissionIds.every(id => selectedPermissions.has(id));
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      allModuleSelected ? modulePermissionIds.forEach(id => newSet.delete(id)) : modulePermissionIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const handleSelectGroup = (module: string, group: string) => {
    const groupPermissions = groupedPermissions[module]?.[group] || [];
    const groupPermissionIds = groupPermissions.map(p => p.permission_id);
    const allGroupSelected = groupPermissionIds.every(id => selectedPermissions.has(id));
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      allGroupSelected ? groupPermissionIds.forEach(id => newSet.delete(id)) : groupPermissionIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const handleAddPermissions = async () => {
    const roleId = getRoleId();
    if (!role || !roleId) {
      alert('No role selected or role ID not found');
      return;
    }
    
    if (selectedPermissions.size === 0) {
      alert('Please select at least one permission');
      return;
    }

    setLoading(true);
    try {
      console.log('Assigning permissions to role:', roleId);
      console.log('Selected permissions:', Array.from(selectedPermissions));

      // Transform selected permissions to match backend format
      const permissionsPayload = Array.from(selectedPermissions).map(permissionId => ({
        permission_id: permissionId,
        can_create: true,  // You can make these configurable if needed
        can_read: true,
        can_update: true,
        can_delete: true
      }));

      // Use your backend API endpoint
      const response = await api.post(`/roles/${roleId}/permissions`, { 
        permissions: permissionsPayload 
      });

      if (response.data.success) {
        alert(`✅ ${response.data.message || `Permissions assigned to role "${role.role_name}" successfully!`}`);
        onSave(); // Refresh the data
        onClose(); // Close the modal
      } else {
        alert(`❌ ${response.data.message || 'Failed to assign permissions'}`);
      }
    } catch (err: any) {
      console.error('Assign permissions error:', err);
      
      let errorMessage = 'Failed to assign permissions';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Get role name safely
  const getRoleName = () => {
    if (!role) return '';
    return role.role_name || role.name || 'Unknown Role';
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
             {t("permission.manage_permissions")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("role.role")}: {getRoleName()} (ID: {getRoleId()})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Bulk Actions */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("common.selected")}: {selectedPermissions.size} of {availablePermissions.length} {t("permission.permission")}
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {selectedPermissions.size === availablePermissions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Permissions Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-3 gap-6">
          {permissionsLoading ? (
            <div className="col-span-3 flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#269A99]"></div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading permissions...</p>
              </div>
            </div>
          ) : availablePermissions.length === 0 ? (
            <div className="col-span-3 flex items-center justify-center py-8">
              <p className="text-gray-500 dark:text-gray-400">{t("permission.no_permission_available")}</p>
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([module, groups]) => {
              const modulePermissions = Object.values(groups).flat();
              const moduleSelectedCount = modulePermissions.filter(p => selectedPermissions.has(p.permission_id)).length;
              const isAllModuleSelected = moduleSelectedCount === modulePermissions.length;

              return (
                <div key={module} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col space-y-4">
                  {/* Module Header */}
                  <div 
                    className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded" 
                    onClick={() => handleSelectModule(module)}
                  >
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white text-sm">{module}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {moduleSelectedCount} of {modulePermissions.length}   {t("common.selected")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-[#269A99]"
                      checked={isAllModuleSelected}
                      onChange={() => handleSelectModule(module)}
                    />
                  </div>

                  {/* Groups inside module */}
                  <div className="flex flex-col gap-3">
                    {Object.entries(groups).map(([groupName, permissions]) => {
                      const groupSelectedCount = permissions.filter(p => selectedPermissions.has(p.permission_id)).length;
                      const isAllGroupSelected = groupSelectedCount === permissions.length;

                      return (
                        <div key={groupName} className="flex flex-col gap-2">
                          <div 
                            className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                            onClick={() => handleSelectGroup(module, groupName)}
                          >
                            <span>{groupName} ({groupSelectedCount}/{permissions.length})</span>
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-[#269A99]"
                              checked={isAllGroupSelected}
                              onChange={() => handleSelectGroup(module, groupName)}
                            />
                          </div>
                          <div className="flex flex-col gap-2 pl-3">
                            {permissions.map(p => (
                              <label 
                                key={p.permission_id} 
                                className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
                              >
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 accent-[#269A99]"
                                  checked={selectedPermissions.has(p.permission_id)}
                                  onChange={() => handlePermissionToggle(p.permission_id)}
                                />
                                <div className="flex-1">
                                  <span className="font-medium">{p.permission_name}</span>
                                  {p.permission_description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {p.permission_description}
                                    </p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 space-x-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{t("permission.current_role_permissions")}</strong> {role.permissions?.length || 0}
          </div>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="px-6 py-2 text-sm h-10" 
              disabled={loading}
            >
            {t("common.cancel")}
            </Button>
            <Button 
              type="button" 
              onClick={handleAddPermissions} 
              className="px-6 py-2 text-sm h-10 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" 
              disabled={loading || selectedPermissions.size === 0}
            >
              {loading ? "Assigning..." : `Assign ${selectedPermissions.size} Permissions`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}