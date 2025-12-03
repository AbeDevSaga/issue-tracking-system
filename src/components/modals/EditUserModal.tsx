// src/components/modals/EditUserModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";
import {
  useUpdateUserMutation,
  useGetUserByIdQuery,
  useGetUserTypesQuery,
  UserType,
  UpdateUserDto,
} from "../../redux/services/userApi";
import {
  useGetInstitutesQuery,
  Institute,
} from "../../redux/services/instituteApi";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { XIcon, Loader2 } from "lucide-react";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUserUpdated?: () => void;
}

interface Role {
  role_id: string;
  name: string;
  description?: string;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    position: "",
    user_type_id: "",
    institute_id: "",
    hierarchy_node_id: "",
    is_active: true,
  });

  const [role_ids, setRoleIds] = useState<string[]>([]);

  // Fetch user data
  const { data: userResponse, isLoading: loadingUser } = useGetUserByIdQuery(
    userId,
    {
      skip: !userId || !isOpen,
    }
  );

  // Fetch user types
  const { data: userTypesResponse, isLoading: loadingUserTypes } =
    useGetUserTypesQuery();
  const userTypes: UserType[] = userTypesResponse?.data || [];

  // Fetch institutes
  const { data: institutes, isLoading: loadingInstitutes } =
    useGetInstitutesQuery();

  // Fetch roles
  const { data: rolesResponse, isLoading: loadingRoles } = useGetRolesQuery(
    undefined,
    {
      skip: !isOpen,
    }
  );
  const roles: Role[] = rolesResponse?.data || rolesResponse || [];

  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const selectedUserType = userTypes.find(
    (ut) => ut.user_type_id === formData.user_type_id
  );

  // Initialize form when user data is loaded
  useEffect(() => {
    if (userResponse?.data) {
      const user = userResponse.data;

      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        position: user.position || "",
        user_type_id: user.user_type_id || "",
        institute_id: user.institute_id || "",
        hierarchy_node_id: user.hierarchy_node_id || "",
        is_active: user.is_active ?? true,
      });

      // Extract role_ids
      let userRoles: string[] = [];
      if (user.roles && Array.isArray(user.roles)) {
        userRoles = user.roles.map((r: any) => r.role_id || r.id || r);
      } else if (user.user_roles && Array.isArray(user.user_roles)) {
        userRoles = user.user_roles.map(
          (ur: any) => ur.role_id || ur.role?.role_id || ur
        );
      } else if (user.role_ids && Array.isArray(user.role_ids)) {
        userRoles = user.role_ids;
      }
      setRoleIds(userRoles);
    }
  }, [userResponse]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear institute if internal user
    if (field === "user_type_id") {
      const newUserType = userTypes.find((ut) => ut.user_type_id === value);
      if (newUserType?.name === "internal_user") {
        setFormData((prev) => ({ ...prev, institute_id: "" }));
      }
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email || !formData.user_type_id) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selectedUserType?.name === "external_user" && !formData.institute_id) {
      toast.error("Please select an institute for external users");
      return;
    }

    const payload: UpdateUserDto & { role_ids?: string[] } = {
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number || undefined,
      position: formData.position || undefined,
      user_type_id: formData.user_type_id,
      institute_id: formData.institute_id || undefined,
      hierarchy_node_id: formData.hierarchy_node_id || undefined,
      is_active: formData.is_active,
      role_ids, // <-- send role_ids to match backend
    };

    try {
      await updateUser({ id: userId, data: payload }).unwrap();
      toast.success("User updated successfully!");
      onUserUpdated?.();
      handleClose();
    } catch (error: any) {
      console.error("Update user error:", error);
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: "",
      email: "",
      phone_number: "",
      position: "",
      user_type_id: "",
      institute_id: "",
      hierarchy_node_id: "",
      is_active: true,
    });
    setRoleIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[800px] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#094C81]">Edit User</h2>
          <button
            onClick={handleClose}
            className="text-[#094C81] hover:text-gray-600 transition"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {loadingUser ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#094C81]" />
            <span className="ml-2 text-[#094C81]">Loading user data...</span>
          </div>
        ) : (
          <>
            {/* Form Fields */}
            <div className="w-full flex flex-col space-y-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pr-2">
                {/* User Type */}
                <div className="space-y-2">
                  <Label>User Type *</Label>
                  <Select
                    value={formData.user_type_id}
                    onValueChange={(value) =>
                      handleInputChange("user_type_id", value)
                    }
                    disabled={loadingUserTypes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select User Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem
                          key={type.user_type_id}
                          value={type.user_type_id}
                        >
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Institute */}
                {selectedUserType?.name === "external_user" && (
                  <div className="space-y-2">
                    <Label>Institute *</Label>
                    <Select
                      value={formData.institute_id}
                      onValueChange={(value) =>
                        handleInputChange("institute_id", value)
                      }
                      disabled={loadingInstitutes}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Institute" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutes?.map((inst: Institute) => (
                          <SelectItem
                            key={inst.institute_id}
                            value={inst.institute_id}
                          >
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    placeholder="+251 9xxxxxxx"
                  />
                </div>

                {/* Active */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 h-12">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        handleInputChange("is_active", e.target.checked)
                      }
                    />
                    <Label>Active User</Label>
                  </div>
                </div>
              </div>

              {/* Roles Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label>Roles</Label>
                  <span>{role_ids.length} role(s) selected</span>
                </div>
                {loadingRoles ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#094C81]" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                    {roles.map((role) => (
                      <div
                        key={role.role_id}
                        className="flex items-start space-x-2 p-2 border rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={role_ids.includes(role.role_id)}
                          onChange={() => handleRoleToggle(role.role_id)}
                        />
                        <label>{role.name}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={updating || loadingUser}>
                {updating ? "Updating..." : "Update User"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
