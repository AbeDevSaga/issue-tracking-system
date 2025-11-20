"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/cn/select";

import { useGetProjectsQuery } from "../../redux/services/projectApi";
import {
  useCreateHierarchyNodeMutation,
  useGetParentNodesQuery,
} from "../../redux/services/hierarchyNodeApi";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  GitForkIcon,
  XIcon,
} from "lucide-react";
import { Textarea } from "../ui/cn/textarea";

interface HierarchyCreateionProps {
  project_id: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateHierarchyNodeModal({
  project_id,
  isOpen,
  onClose,
}: HierarchyCreateionProps) {
  const [selectedParentNode, setSelectedParentNode] = useState<string | null>(
    null
  );

  const [navigationStack, setNavigationStack] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch all nodes of a project
  const { data: parentNodesData, isFetching: isFetchingParents } =
    useGetParentNodesQuery(project_id, {
      skip: !project_id,
    });

  const [createNode, { isLoading: isCreatingNode }] =
    useCreateHierarchyNodeMutation();

  if (!isOpen) return null;

  // Get the tree from API response - FIXED: Use 'nodes' instead of 'parentNodes'
  const tree = parentNodesData?.nodes || [];

  // Get current level nodes based on navigation stack
  const getCurrentLevelNodes = () => {
    if (navigationStack.length === 0) {
      return tree;
    }

    // Navigate through the tree based on the stack
    let currentNode = tree;
    for (const stackItem of navigationStack) {
      const foundNode = currentNode.find(
        (node: any) => node.hierarchy_node_id === stackItem.hierarchy_node_id
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
      // Clear selection when navigating deeper
      setSelectedParentNode(null);
    }
  };

  // Move back
  const goBack = () => {
    setNavigationStack((prev) => {
      const newStack = prev.slice(0, -1);
      // Clear selection when going back
      setSelectedParentNode(null);
      return newStack;
    });
  };

  const resetNavigation = () => {
    setNavigationStack([]);
    setSelectedParentNode(null);
  };

  // Handle node selection
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedParentNode(nodeId);
  };

  // Get current path display - for better UX
  const getCurrentPath = () => {
    if (navigationStack.length === 0) return "Root";
    return navigationStack.map((node) => node.name).join(" → ");
  };

  // Debug function to check the data
  const debugData = () => {
    console.log("Tree data:", tree);
    console.log("Current level nodes:", currentLevelNodes);
    console.log("Navigation stack:", navigationStack);
    console.log("Selected parent:", selectedParentNode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Structure name is required");
      return;
    }

    try {
      await createNode({
        project_id: project_id,
        parent_id: selectedParentNode || null,
        name,
        description,
        is_active: true,
      }).unwrap();

      toast.success("Structure created!");

      setName("");
      setDescription("");
      resetNavigation();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create structure");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[700px] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#094C81]">
            Create Structure Node
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Debug button - remove in production */}
        <button
          type="button"
          onClick={debugData}
          className="text-xs bg-gray-200 p-1 rounded mb-2"
          style={{ display: "none" }} // Hidden by default
        >
          Debug Data
        </button>

        <form onSubmit={handleSubmit} className="space-y-4  ">
          <div className="flex gap-10">
            <div className="w-1/2 flex flex-col gap-4">
              {/* Node Name */}
              <div>
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Structure Name *
                </Label>
                <Input
                  id="structure-name"
                  placeholder="Enter structure name"
                  value={name}
                  className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="structure-description"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Description
                </Label>
                <Textarea
                  id="structure-description"
                  placeholder="Enter structure description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
            </div>
            <div className="w-1/2 flex flex-col">
              {/* Structure Selection */}
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Select Parent Structure (optional)
              </Label>

              <div className="border p-3 rounded-lg">
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
                    {navigationStack.length === 0 && (
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
                    <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                      {currentLevelNodes?.length === 0 ? (
                        <p className="text-sm text-center py-4 text-[#094C81] font-medium">
                          No structures found at this level
                        </p>
                      ) : (
                        currentLevelNodes?.map((node: any) => (
                          <div
                            key={node.hierarchy_node_id}
                            className={`flex border items-center
                              hover:bg-gray-100 
                              ${
                                selectedParentNode === node.hierarchy_node_id
                                  ? "bg-blue-100 border border-blue-300 text-blue-800"
                                  : "hover:bg-gray-100 border rounded-md"
                              }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleNodeSelect(node.hierarchy_node_id)
                              }
                              className={`block text-left w-full py-2 px-3 rounded-md mb-2 transition-colors ${
                                selectedParentNode === node.hierarchy_node_id
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

                            {node.children && node.children.length > 0 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => enterStructure(node)}
                                className="bg-transparent border-none opacity-70 group-hover:opacity-100 transition-opacity ml-2"
                                title={`Explore ${node.name} structure`}
                              >
                                <ArrowRightIcon className="w-6 h-6 hover:text-[#094C81]" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Selected parent info */}
                    {selectedParentNode && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm border border-blue-200">
                        <div className="flex items-center text-[#094C81] font-medium">
                          <span className="mr-2">
                            <CheckIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <strong>Selected Parent:</strong>{" "}
                            {
                              currentLevelNodes?.find(
                                (n: any) =>
                                  n.hierarchy_node_id === selectedParentNode
                              )?.name
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreatingNode}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isCreatingNode || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreatingNode ? "Creating..." : "Create Structure"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
