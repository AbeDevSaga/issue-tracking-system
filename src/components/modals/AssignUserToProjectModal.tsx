"use client";

import React, { useState, useEffect } from "react";

import { useAssignUserToProjectMutation } from "../../redux/services/projectApi";

import { useGetUsersQuery } from "../../redux/services/userApi";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { useGetParentNodesQuery } from "../../redux/services/hierarchyNodeApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/cn/dialog";
import { Button } from "../ui/cn/button";
import { Label } from "../ui/cn/label";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  GitForkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface AssignUserModalProps {
  inistitute_id?: string;
  hierarchy_node_id: string;
  hierarchy_node_name: string;
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
  const { data: usersResponse } = useGetUsersQuery(
    inistitute_id ? { institute_id: inistitute_id } : undefined
  );
  //  inistitute_id ? { institute_id: inistitute_id } : undefined
  const { data: rolesResponse } = useGetRolesQuery(undefined);

  const [assignUserToProject] = useAssignUserToProjectMutation();

  const users = usersResponse?.data || [];
  const roles = rolesResponse?.data || [];

  // structure tree from API

  // selections
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSubRole, setSelectedSubRole] = useState("");

  // navigation stack for structure tree

  const rolesMap = roles.map((r: any) => ({
    ...r,
    subRoles: r?.roleSubRoles?.map((s: any) => s.subRole) || [],
  }));

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Select user and role first");
      return;
    }

    try {
      await assignUserToProject({
        project_id: project_id,
        user_id: selectedUser,
        role_id: selectedRole,
        sub_role_id: selectedSubRole || undefined,
        hierarchy_node_id: hierarchy_node_id,
      }).unwrap();

      toast.success("User assigned successfully");

      setSelectedUser("");
      setSelectedRole("");
      setSelectedSubRole("");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign user");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-[#094C81]">
            Assign User to {hierarchy_node_name} Node
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-10 mt-4">
          {/* LEFT SIDE — FORM */}
          <div className="flex justify-between gap-4">
            {/* user */}
            <div className="w-1/2">
              <Label className="text-sm font-medium text-[#094C81]">
                Select User
              </Label>
              <select
                className="w-full border p-2 rounded mt-1"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* role */}
            <div className="w-1/2">
              <Label className="text-sm font-medium text-[#094C81]">
                Select Role
              </Label>
              <select
                className="w-full border p-2 rounded mt-1"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setSelectedSubRole("");
                }}
              >
                <option value="">Select role</option>
                {rolesMap.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assign Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleAssign}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Assign User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
