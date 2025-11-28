// src/components/admin/RoleAssignmentModal.tsx
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Button from "../../ui/button/Button";
import { CityAdmin, Role } from "./CityAdminListTable";
import { toast } from "sonner";
interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: CityAdmin | null;
  roles: Role[];
  loading: boolean;
  onAssignRole: (roleId: string) => void;
}

export default function RoleAssignmentModal({
  isOpen,
  onClose,
  admin,
  roles,
  loading,
  onAssignRole,
}: RoleAssignmentModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleId("");
    }
  }, [isOpen]);

  const handleAssign = () => {
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }
    onAssignRole(selectedRoleId);
  };

  // Get selected role details safely
  const selectedRole = selectedRoleId 
    ? roles.find((r) => r.id === selectedRoleId)
    : null;

  // Safely get permissions array
  const permissions = selectedRole?.permissions || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Assign Role to {admin?.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#269A99]"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400">No roles available.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Create roles first to assign them to users.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#269A99] focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Choose a role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRole && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role Description:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {selectedRole.description || "No description available."}
                  </p>
                  
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role Permissions:
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {permissions.length > 0 ? (
                      permissions.map((permission) => (
                        <div
                          key={permission.permissionId}
                          className="text-xs text-gray-600 dark:text-gray-400 py-1 flex items-start"
                        >
                          <span className="mr-2">•</span>
                          <div>
                            <div className="font-medium">{permission.permissionName}</div>
                            {permission.description && (
                              <div className="text-gray-500 text-xs">
                                {permission.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No permissions assigned to this role.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> This will assign the selected role to {admin?.name}. 
                  The user will gain all permissions associated with this role.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedRoleId || loading}
            className="px-4 py-2 bg-[#269A99] hover:bg-[#1d7d7d] text-white disabled:opacity-50"
          >
            Assign Role
          </Button>
        </div>
      </div>
    </div>
  );
}