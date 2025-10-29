// src/components/roles/RoleModal.tsx
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../services/api";
import Button from "../../ui/button/Button";
import { Role } from "./RoleListTable";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSave: () => void;
}

export default function RoleModal({
  isOpen,
  onClose,
  role,
  onSave,
}: RoleModalProps) {
  const [formData, setFormData] = useState({
    role_name: "",
    role_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get role ID safely - handle both role_id and id properties
  const getRoleId = () => {
    if (!role) return null;
    return role.role_id || role.id;
  };

  // Get role name safely
  const getRoleName = () => {
    if (!role) return '';
    return role.role_name || role.name || 'Unknown Role';
  };

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setFormData({
          role_name: getRoleName(),
          role_description: role.role_description || role.description || "",
        });
      } else {
        setFormData({
          role_name: "",
          role_description: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.role_name.trim()) {
      newErrors.role_name = "Role name is required";
    } else if (formData.role_name.length < 2) {
      newErrors.role_name = "Role name must be at least 2 characters";
    }

    if (formData.role_description.length > 500) {
      newErrors.role_description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (role) {
        // Update existing role
        const roleId = getRoleId();
        if (!roleId) {
          throw new Error('Role ID not found');
        }

        const response = await api.put(`/roles/${roleId}`, formData);
        
        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.data.message || 'Role updated successfully',
            timer: 2000,
            showConfirmButton: false
          });
          onSave();
          onClose();
        } else {
          throw new Error(response.data.message || 'Failed to update role');
        }
      } else {
        // Create new role
        const response = await api.post("/roles", formData);
        
        if (response.data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.data.message || 'Role created successfully',
            timer: 2000,
            showConfirmButton: false
          });
          onSave();
          onClose();
        } else {
          throw new Error(response.data.message || 'Failed to create role');
        }
      }
    } catch (err: any) {
      console.error('Save role error:', err);
      
      let errorMessage = err.response?.data?.message || err.message || "Failed to save role";
      
      if (err.response?.status === 409) {
        setErrors({ role_name: "A role with this name already exists" });
        errorMessage = "A role with this name already exists";
      } else if (err.response?.status === 404) {
        errorMessage = "Role not found";
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: errorMessage,
        confirmButtonColor: '#269A99'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    // Check if there are unsaved changes
    const hasChanges = role 
      ? formData.role_name !== getRoleName() || formData.role_description !== (role.role_description || role.description || "")
      : formData.role_name.trim() !== "" || formData.role_description.trim() !== "";

    if (hasChanges) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#269A99',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, close it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {role ? "Edit Role" : "Create New Role"}
              </h3>
              {role && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID: {getRoleId()}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#269A99] focus:border-[#269A99] focus:outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.role_name ? "border-red-500 ring-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter role name"
                disabled={loading}
              />
              {errors.role_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="role_description"
                value={formData.role_description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#269A99] focus:border-[#269A99] focus:outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.role_description ? "border-red-500 ring-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter role description (optional)"
                disabled={loading}
              />
              {errors.role_description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role_description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.role_description.length}/500 characters
              </p>
            </div>

            {role && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>💡 Note:</strong> Use the "Manage Permissions" option to add or remove permissions for this role.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2 text-sm"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 text-sm bg-[#269A99] hover:bg-[#1d7d7d] text-white disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {role ? "Updating..." : "Creating..."}
                </div>
              ) : (
                role ? "Update Role" : "Create Role"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}