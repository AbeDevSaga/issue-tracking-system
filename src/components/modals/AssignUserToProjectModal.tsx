"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";

import { useAssignUserToProjectMutation } from "../../redux/services/projectApi";
import { useGetUsersNotAssignedToProjectQuery } from "../../redux/services/userApi";
import { useGetRolesQuery } from "../../redux/services/roleApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/cn/dialog";
import { Button } from "../ui/cn/button";
import { Label } from "../ui/cn/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAuth } from "../../contexts/AuthContext";

interface AssignUserModalProps {
  inistitute_id?: string;
  hierarchy_node_id: string;
  hierarchy_node_name?: string;
  project_id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignUserModal({
  inistitute_id,
  project_id,
  hierarchy_node_id,
  hierarchy_node_name,
  isOpen,
  onClose,
}: AssignUserModalProps) {
  // const { data: usersResponse } = useGetUsersQuery(
  //   inistitute_id ? { institute_id: inistitute_id } : undefined
  // );
  const { user } = useAuth();
  console.log("User in isPermittedActionButton:", user);

  const { data: usersResponse, isLoading } =
    useGetUsersNotAssignedToProjectQuery(
      inistitute_id && project_id
        ? { institute_id: inistitute_id, project_id }
        : skipToken
    );

  const { data: rolesResponse } = useGetRolesQuery(undefined);

  const [assignUserToProject] = useAssignUserToProjectMutation();

const users = usersResponse?.data || [];

  console.log("userssssssssssssssssssssss", users);
  const roles = rolesResponse?.data || [];

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Filter roles based on selected user's roles
  const availableRoles = useMemo(() => {
    if (!selectedUser) return [];
    const user = users.find((u) => u.user_id === selectedUser);
    if (!user || !user.userRoles) return [];
    return user.userRoles
      .map((ur) => {
        const role = roles.find((r) => r.role_id === ur.role_id);
        return role ? { role_id: role.role_id, name: role.name } : null;
      })
      .filter(Boolean) as { role_id: string; name: string }[];
  }, [selectedUser, users, roles]);

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error("Select user and role first");
      return;
    }

    const user = users.find((u) => u.user_id === selectedUser);
    console.log("Selected user:", user);
    const isExternal = user?.userType?.name === "external_user";

    // External users must have hierarchy node
    if (isExternal && !hierarchy_node_id) {
      toast.error("External users must be assigned to a hierarchy node");
      return;
    }

    try {
      await assignUserToProject({
        project_id,
        user_id: selectedUser,
        // role_id: selectedRole,
        // sub_role_id: selectedSubRole || undefined,
        hierarchy_node_id: hierarchy_node_id,
      }).unwrap();

      toast.success("User assigned successfully");
      setSelectedUser(null);
      setSelectedRole(null);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign user");
    }
  };
  console.log(
    "project_id: ",
    project_id,
    "hierarchy_node_name: ",
    hierarchy_node_name,
    "hierarchy_node_id: ",
    hierarchy_node_id
  );
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-[#094C81]">Assign User</DialogTitle>
        </DialogHeader>

        <div className="flex gap-10 mt-4">
          <div className="flex justify-between w-full gap-4">
            {/* USER */}
            <div className="w-full">
              <Label className="text-sm font-medium text-[#094C81]">
                Select User
              </Label>
              <Select
                value={selectedUser || ""}
                onValueChange={setSelectedUser}
              >
                <SelectTrigger className="w-full border p-2 rounded mt-1 text-[#094C81]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="text-[#094C81] bg-white">
                  {users.length > 0 ? (
                    users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.full_name} ({u.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key="no-user" value="none" disabled>
                      No users available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>

        {/* Assign Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleAssign}
            className="bg-[#094C81] hover:bg-[#094C81]/90 text-white"
          >
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
