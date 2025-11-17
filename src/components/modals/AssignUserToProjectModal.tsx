"use client";

import React, { useState, useEffect } from "react";

import {
  useAssignUserToProjectMutation,
} from "../../redux/services/projectApi";

import { useGetUsersQuery } from "../../redux/services/userApi";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { useGetParentNodesQuery } from "../../redux/services/hierarchyNodeApi";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/cn/dialog";
import { Button } from "../ui/cn/button";
import { Label } from "../ui/cn/label";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, GitForkIcon } from "lucide-react";
import { toast } from "sonner";

export default function AssignUserModal({ project, isOpen, onClose }: { project: any, isOpen: boolean, onClose: () => void }) {
  const { data: usersResponse } = useGetUsersQuery();
  const { data: rolesResponse } = useGetRolesQuery(undefined);
  const { data: structuresResponse, isFetching: isFetchingNodes } =
    useGetParentNodesQuery(project?.project_id, { skip: !isOpen });

  const [assignUserToProject] = useAssignUserToProjectMutation();

  const users = usersResponse?.data || [];
  const roles = rolesResponse?.data || [];

  // structure tree from API
  const tree = structuresResponse?.nodes || [];

  // selections
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSubRole, setSelectedSubRole] = useState("");
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);

  // navigation stack for structure tree
  const [navStack, setNavStack] = useState<any[]>([]);

  // get current level nodes based on navigation
  const getCurrentLevelNodes = () => {
    if (navStack.length === 0) return tree;

    let current = tree;
    for (const node of navStack) {
      const found = current.find((n) => n.hierarchy_node_id === node.hierarchy_node_id);
      if (found && found.children) {
        current = found.children;
      } else return [];
    }

    return current;
  };

  const currentNodes = getCurrentLevelNodes();

  const rolesMap = roles.map((r: any) => ({
    ...r,
    subRoles: r?.roleSubRoles?.map((s: any) => s.subRole) || [],
  }));


  // navigation
  const enter = (node: any) => {
    if (node.children?.length > 0) {
      setNavStack((prev) => [...prev, node]);
      setSelectedStructureId(null);
    }
  };

  const goBack = () => {
    setNavStack((prev) => {
      const newStack = prev.slice(0, -1);
      setSelectedStructureId(null);
      return newStack;
    });
  };

  const resetTree = () => {
    setNavStack([]);
    setSelectedStructureId(null);
  };

  const getCurrentPath = () => {
    if (navStack.length === 0) return "Root";
    return navStack.map((n) => n.name).join(" → ");
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Select user and role first");
      return;
    }

    try {
      await assignUserToProject({
        project_id: project.project_id,
        user_id: selectedUser,
        role_id: selectedRole,
        sub_role_id: selectedSubRole || undefined,
        hierarchy_node_id: selectedStructureId,
      }).unwrap();

      toast.success("User assigned successfully");

      setSelectedUser("");
      setSelectedRole("");
      setSelectedSubRole("");
      resetTree();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign user");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-[#094C81]">Assign User to Project</DialogTitle>
        </DialogHeader>

        <div className="flex gap-10 mt-4">
          {/* LEFT SIDE — FORM */}
          <div className="w-1/2 flex flex-col gap-4">

            {/* user */}
            <div>
              <Label className="text-sm font-medium text-[#094C81]">Select User</Label>
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
            <div>
              <Label className="text-sm font-medium text-[#094C81]">Select Role</Label>
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

          {/* RIGHT SIDE — STRUCTURE TREE */}
          <div className="w-1/2">
            <Label className="block text-sm text-[#094C81] font-medium mb-2">
              Select Structure (optional)
            </Label>

            <div className="border p-3 rounded-lg">
              {isFetchingNodes ? (
                <p>Loading structures...</p>
              ) : (
                <>
                  {/* Back button */}
                  {navStack.length > 0 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center mb-2 hover:bg-gray-100 rounded-md p-2"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2 text-[#094C81]" />
                      <span className="text-sm text-[#094C81] font-medium">Back</span>
                    </button>
                  )}

                  {/* current path */}
                  {navStack.length > 0 && (
                    <div className="text-sm text-[#094C81] font-medium mb-2">
                      Current: {getCurrentPath()}
                    </div>
                  )}

                  {/* Root selection */}
                  {navStack.length === 0 && (
                    <button
                      type="button"
                      className={`block text-left w-full py-2 px-3 rounded-md mb-2 border
                        ${
                          selectedStructureId === null
                            ? "bg-blue-100 border-blue-300 text-blue-800"
                            : "hover:bg-gray-100"
                        }`}
                      onClick={() => setSelectedStructureId(null)}
                    >
                      <div className="flex items-center">
                        <GitForkIcon className="w-4 h-4 mr-2" />
                        <div>
                          <div className="font-medium">Root Structure</div>
                          <div className="text-sm text-gray-600">
                            Assign at project root
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* node list */}
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {currentNodes.length === 0 ? (
                      <p className="text-sm text-center py-4 text-[#094C81]">
                        No structures found
                      </p>
                    ) : (
                      currentNodes.map((node) => (
                        <div
                          key={node.hierarchy_node_id}
                          className={`flex items-center border rounded-md
                            ${
                              selectedStructureId === node.hierarchy_node_id
                                ? "bg-blue-100 border-blue-300"
                                : "hover:bg-gray-100"
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStructureId(node.hierarchy_node_id)
                            }
                            className="flex-1 text-left py-2 px-3"
                          >
                            <div className="flex items-center text-sm text-[#094C81]">
                              <GitForkIcon className="w-4 h-4 mr-2" />
                              <div className="flex flex-col">
                                <span className="font-medium">{node.name}</span>
                                <span className="text-xs text-gray-500">
                                  Level {node.level} • {node.children?.length || 0} children
                                </span>
                              </div>
                            </div>
                          </button>

                          {node.children?.length > 0 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => enter(node)}
                              className="bg-transparent border-none ml-2 opacity-70 hover:opacity-100"
                            >
                              <ArrowRightIcon className="w-6 h-6 hover:text-[#094C81]" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* selected info */}
                  {selectedStructureId && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200 text-sm">
                      <div className="flex items-center text-[#094C81]">
                        <CheckIcon className="w-4 h-4 mr-2" />
                        <strong>Selected:</strong>{" "}
                        {
                          currentNodes.find(
                            (n) => n.hierarchy_node_id === selectedStructureId
                          )?.name
                        }
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Assign Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={handleAssign} className="bg-blue-600 hover:bg-blue-700 text-white">
            Assign User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
