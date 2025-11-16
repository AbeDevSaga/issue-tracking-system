"use client";

import React, { useEffect, useState } from "react";
import { Label } from "../ui/cn/label";
import { Input } from "../ui/cn/input";
import { Button } from "../ui/cn/button";
import { toast } from "sonner";
import Select, { MultiValue } from "react-select";
import { useGetPermissionsQuery } from "../../redux/services/permissionApi";
import { useCreateRoleMutation } from "../../redux/services/roleApi";
import { XIcon } from "lucide-react";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PermissionOption {
  value: string;
  label: string;
}

interface Permission {
  permission_id: string;
  resource: string;
  action: string;
  is_active: boolean | null;
}

interface SubRoleItem {
  name: string;
  permission_ids: PermissionOption[];
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [useSubRoles, setUseSubRoles] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionOption[]
  >([]);
  const [subRoles, setSubRoles] = useState<SubRoleItem[]>([]);

  const { data: permissionsData, isLoading: loadingPermissions } =
    useGetPermissionsQuery();

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();

  const activePermissions = (permissionsData?.data || []).filter(
    (p: Permission) => p.is_active === true
  );

  const permissionOptions: PermissionOption[] = activePermissions.map((p) => ({
    value: p.permission_id,
    label: `${p.resource} - ${p.action}`,
  }));

  const handleAddSubRole = () => {
    setSubRoles([...subRoles, { name: "", permission_ids: [] }]);
  };

  const handleSubRoleChange = (index: number, key: string, value: any) => {
    const updated = [...subRoles];
    if (key === "name") updated[index].name = value;
    else if (key === "permissions") updated[index].permission_ids = value;
    setSubRoles(updated);
  };

  const handleRemoveSubRole = (index: number) => {
    const updated = [...subRoles];
    updated.splice(index, 1);
    setSubRoles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (useSubRoles) {
      for (const sr of subRoles) {
        if (!sr.name.trim()) {
          toast.error("All sub-roles must have a name");
          return;
        }
      }
    }

    try {
      await createRole({
        name,
        description,
        permission_ids: useSubRoles
          ? []
          : selectedPermissions.map((p) => p.value),
        sub_roles: useSubRoles
          ? subRoles.map((sr) => ({
              sub_role_id: "",
              name: sr.name,
              permission_ids: sr.permission_ids.map((p) => p.value),
            }))
          : [],
      }).unwrap();

      toast.success("Role created successfully!");

      setName("");
      setDescription("");
      setSelectedPermissions([]);
      setUseSubRoles(false);
      setSubRoles([]);

      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create role");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setSelectedPermissions([]);
      setUseSubRoles(false);
      setSubRoles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-[700px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create New Role
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex w-full flex-col"
        >
          <div className="flex w-full gap-10">
            <div className="w-1/2 flex flex-col gap-4">
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="name"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Role Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter role name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col w-1/2">
              <Label
                htmlFor="description"
                className="block text-sm text-[#094C81] font-medium mb-2"
              >
                Description
              </Label>
              <Input
                id="description"
                placeholder="Enter description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>
          <div className="col-span-2">  
              <Label className="block text-sm text-[#094C81] font-medium">Permissions</Label>
            </div>
          <div className="grid grid-cols-3 gap-3 border rounded-md p-3 max-h-64 overflow-y-auto">
            
            {permissionOptions.length === 0 && (
              <p className="text-sm text-gray-500 col-span-2">
                No active permissions available
              </p>
            )}

            {permissionOptions.map((option) => {
              const isChecked = selectedPermissions.some(
                (p) => p.value === option.value
              );

              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions((prev) => [...prev, option]);
                      } else {
                        setSelectedPermissions((prev) =>
                          prev.filter((p) => p.value !== option.value)
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
