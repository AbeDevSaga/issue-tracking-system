"use client";

import { useState } from "react";

import {
  useAssignInternalUserToProjectMutation,
  useAssignUserToProjectMutation,
} from "../../redux/services/projectApi";

import {
  useGetInternalUsersNotAssignedToProjectQuery,
  useGetUsersNotAssignedToProjectQuery,
  useGetUsersQuery,
} from "../../redux/services/userApi";
import { useGetRolesQuery } from "../../redux/services/roleApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/cn/dialog";
import { Button } from "../ui/cn/button";
import { Label } from "../ui/cn/label";

import { toast } from "sonner";

// ⭐ shadcn Select
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetInternalTreeQuery } from "../../redux/services/internalNodeApi";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  GitForkIcon,
} from "lucide-react";

interface AssignUserModalProps {
  internal_node_id?: string;
  internal_node_name?: string;
  project_id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignInternalUsersModal({
  project_id,
  internal_node_id,
  internal_node_name,
  isOpen,
  onClose,
}: AssignUserModalProps) {
  // const { data: usersResponse } = useGetUsersQuery(
  //   inistitute_id ? { institute_id: inistitute_id } : undefined
  // );
  const [selectedParentNode, setSelectedParentNode] = useState<string | null>(
    null
  );
  const [hasSelectedParent, setHasSelectedParent] = useState(false);

  const [navigationStack, setNavigationStack] = useState<any[]>([]);

  const { data: internalUsers, isLoading } =
    useGetInternalUsersNotAssignedToProjectQuery(project_id, {
      skip: !project_id,
    });

  // Fetch all nodes of a project - skip if parent_hierarchy_node_id is provided
  const { data: parentNodesData, isFetching: isFetchingParents } =
    useGetInternalTreeQuery();
  const { data: rolesResponse } = useGetRolesQuery(undefined);

  const [assignUserToProject] = useAssignInternalUserToProjectMutation();

  const users = internalUsers?.data || [];
  const roles = rolesResponse?.data || [];

  const tree = parentNodesData?.nodes || [];

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const rolesMap = roles.map((r: any) => ({
    ...r,
    subRoles: r?.roleSubRoles?.map((s: any) => s.subRole) || [],
  }));

  // Get current level nodes based on navigation stack
  const getCurrentLevelNodes = () => {
    if (navigationStack.length === 0) {
      return tree;
    }

    // Navigate through the tree based on the stack
    let currentNode = tree;
    for (const stackItem of navigationStack) {
      const foundNode = currentNode.find(
        (node: any) => node.internal_node_id === stackItem.internal_node_id
      );
      if (foundNode && foundNode.children) {
        currentNode = foundNode.children;
      } else {
        return [];
      }
    }
    return currentNode;
  };

  const currentLevelNodes = getCurrentLevelNodes();

  // Move deeper into a structure
  const enterStructure = (node: any) => {
    if (node.children && node.children.length > 0) {
      setNavigationStack((prev) => [...prev, node]);
    }
  };

  // Move back
  const goBack = () => {
    setNavigationStack((prev) => {
      const newStack = prev.slice(0, -1);
      // Only clear selection if we're going back from the root level
      if (newStack.length === 0) {
        setSelectedParentNode(null);
        setHasSelectedParent(false);
      }
      return newStack;
    });
  };

  const resetNavigation = () => {
    setNavigationStack([]);
    setSelectedParentNode(null);
    setHasSelectedParent(false);
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedParentNode(nodeId);
    setHasSelectedParent(true);
  };

  // Get current path display - for better UX
  const getCurrentPath = () => {
    if (navigationStack.length === 0) return "Root";
    return navigationStack.map((node) => node.name).join(" → ");
  };

  // Get the full selected node object including from nested structures
  const getSelectedNode = () => {
    if (!selectedParentNode) return null;

    // First check current level
    const currentNode = currentLevelNodes?.find(
      (node: any) => node.internal_node_id === selectedParentNode
    );
    if (currentNode) return currentNode;

    // If not found in current level, search through the entire tree
    const searchInTree = (nodes: any[]): any => {
      for (const node of nodes) {
        if (node.internal_node_id === selectedParentNode) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = searchInTree(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return searchInTree(tree);
  };

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
        internal_node_id: internal_node_id || selectedParentNode || "",
      }).unwrap();

      toast.success("User assigned successfully");

      setSelectedUser("");
      setSelectedRole("");

      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign user");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-[#094C81]">
            Assign User
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-4">
          {/* LEFT SIDE — FORM */}
          <div className="w-1/2 flex flex-col  gap-4">
            {/* USER */}
            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Select User
              </Label>

              <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className=" h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="text-[#094C81] *: bg-white">
                  {users.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ROLE */}
            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Select Role
              </Label>

              <Select
                value={selectedRole}
                onValueChange={(value) => {
                  setSelectedRole(value);
                }}
              >
                <SelectTrigger className=" h-12 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="text-[#094C81] bg-white">
                  {rolesMap.map((r) => (
                    <SelectItem key={r.role_id} value={r.role_id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RIGHT SIDE-FORM */}
          <div className="w-1/2 ">
            <div
              className={`w-full flex flex-col transition-all duration-500 ${
                hasSelectedParent ? "w-1/2" : "w-full"
              }`}
            >
              {/* Structure Selection */}
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Select Parent Issue Flow {!hasSelectedParent && "(required)"}
              </Label>

              <div className=" rounded-lg">
                {isFetchingParents ? (
                  <p className="text-sm text-gray-500">Loading structures...</p>
                ) : (
                  <>
                    {/* Back Button */}
                    {navigationStack.length > 0 && (
                      <button
                        type="button"
                        onClick={goBack}
                        className="mb-2 flex items-center hover:bg-gray-100 rounded-md p-2 border-none outline-none shadow-none text-sm"
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-2 text-[#094C81]" />
                        <span className="text-sm text-[#094C81] font-medium">
                          Back{" "}
                        </span>
                      </button>
                    )}
                    {/* Current Path Display */}
                    {navigationStack.length > 0 && (
                      <div className="text-sm text-[#094C81] font-medium mb-2">
                        Current: {getCurrentPath()}
                      </div>
                    )}

                    {/* Root Option - Only show at root level */}
                    {currentLevelNodes.length === 0 && (
                      <button
                        type="button"
                        className={`block border text-left w-full py-2 px-3 rounded-md mb-2 transition-colors ${
                          selectedParentNode === null
                            ? "bg-blue-100 border border-blue-300 text-blue-800"
                            : "hover:bg-gray-100 border"
                        }`}
                        onClick={() => handleNodeSelect(null)}
                      >
                        <div className="flex items-center text-sm text-[#094C81] font-medium">
                          <span className="mr-2">
                            <GitForkIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="font-medium">Root Structure</div>
                            <div className="text-sm text-gray-600">
                              Create at project root level
                            </div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Structure Tree */}
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {currentLevelNodes?.length === 0 ? (
                        <p className="text-sm text-center py-4 text-[#094C81] font-medium">
                          No structures found at this level
                        </p>
                      ) : (
                        currentLevelNodes?.map((node: any) => (
                          <div
                            key={node.internal_node_id}
                            className={`flex border items-center
                                            hover:bg-gray-100 pr-2
                                            ${
                                              selectedParentNode ===
                                              node.internal_node_id
                                                ? "bg-blue-100 border border-blue-300 text-blue-800"
                                                : "hover:bg-gray-100 border rounded-md"
                                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleNodeSelect(node.internal_node_id)
                              }
                              className={`block text-left  w-full py-2 px-3 rounded-md mb-2 transition-colors ${
                                selectedParentNode === node.internal_node_id
                                  ? "    text-blue-800"
                                  : "hover:bg-gray-100 "
                              }`}
                            >
                              <div className="flex  w-full items-center text-sm text-[#094C81] font-medium">
                                <span className="mr-2 mt-0.5">
                                  <GitForkIcon className="w-4 h-4" />
                                </span>
                                <div className="flex-1">
                                  <div className="font-medium">{node.name}</div>
                                  {node.description && (
                                    <div className="text-sm text-gray-600 truncate">
                                      {node.description}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Level {node.level} •{" "}
                                    {node.children?.length || 0} children
                                  </div>
                                </div>
                              </div>
                            </button>
                            <div className="flex justify-center items-center">

                            {selectedParentNode === node.internal_node_id && (
                                  <CheckCircleIcon className="w-5 h-5 text-green-800 mr-2" />
                                )}
                            {node.children && node.children.length > 0 && (
                              <button
                                type="button"
                                onClick={() => enterStructure(node)}
                                className="bg-transparent border-none opacity-70 group-hover:opacity-100 transition-opacity ml-2"
                                title={`Explore ${node.name} structure`}
                              >
                                <ArrowRightIcon className="w-6 h-6 hover:text-[#094C81]" />
                              </button>
                            )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Selected parent info */}
                    {/* {selectedParentNode && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm border border-blue-200">
                        <div className="flex items-center text-[#094C81] font-medium">
                          <span className="mr-2">
                            <CheckIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <strong>Selected Parent:</strong>{" "}
                            {getSelectedNode()?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    )} */}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assign Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleAssign}
            className="bg-[#094C81] hover:bg-[#094C81]/90 text-white"
          >
            Assign User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
