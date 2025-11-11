"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/cn/dialog";
import { Label } from "../ui/cn/label";
import { Input } from "../ui/cn/input";
import { Button } from "../ui/cn/button";
import { toast } from "sonner";
import Select, { MultiValue } from "react-select";
import { useGetPermissionsQuery } from "../../redux/services/permissionApi";
import { useCreateRoleMutation } from "../../redux/services/roleApi";

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

    // Validation for sub-roles
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
          ? [] // Hide role-level permissions if using sub-roles
          : selectedPermissions.map((p) => p.value),
        sub_roles: useSubRoles
          ? subRoles.map((sr) => ({
              sub_role_id: "", // Optional if you have predefined sub-roles; else can be created server-side
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
      console.error("Failed to create role:", error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              placeholder="Enter role name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useSubRoles}
              onChange={(e) => setUseSubRoles(e.target.checked)}
              id="useSubRoles"
            />
            <Label htmlFor="useSubRoles">
              Assign permissions via sub-roles
            </Label>
          </div>

          {!useSubRoles && (
            <div>
              <Label>Permissions</Label>
              <Select
                isMulti
                options={permissionOptions}
                value={selectedPermissions}
                onChange={(value: MultiValue<PermissionOption>) =>
                  setSelectedPermissions(value as PermissionOption[])
                }
                isLoading={loadingPermissions}
                placeholder="Select active permissions..."
                className="mt-1"
              />
            </div>
          )}

          {useSubRoles && (
            <div className="space-y-3">
              <Label>Sub-Roles</Label>
              {subRoles.map((sr, index) => (
                <div key={index} className="border p-2 rounded space-y-2">
                  <Input
                    placeholder="Sub-role name"
                    value={sr.name}
                    onChange={(e) =>
                      handleSubRoleChange(index, "name", e.target.value)
                    }
                    required
                  />
                  <Select
                    isMulti
                    options={permissionOptions}
                    value={sr.permission_ids}
                    onChange={(value: MultiValue<PermissionOption>) =>
                      handleSubRoleChange(
                        index,
                        "permissions",
                        value as PermissionOption[]
                      )
                    }
                    isLoading={loadingPermissions}
                    placeholder="Select permissions for this sub-role"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-1"
                    onClick={() => handleRemoveSubRole(index)}
                  >
                    Remove Sub-Role
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubRole}
              >
                Add Sub-Role
              </Button>
            </div>
          )}

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
