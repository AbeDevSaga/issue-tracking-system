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

export function CreateHierarchyNodeModal({ isOpen, onClose }: any) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedParentNode, setSelectedParentNode] = useState<string | null>(
    null
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // ✅ Fetch projects
  const { data: projects, isLoading: isLoadingProjects } =
    useGetProjectsQuery();

  // ✅ Fetch parent nodes when project changes
  const { data: parentNodes, isFetching: isFetchingParents } =
    useGetParentNodesQuery(selectedProject, { skip: !selectedProject });

  // ✅ Mutation for creating node
  const [createNode, { isLoading: isCreatingNode }] =
    useCreateHierarchyNodeMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    if (!name.trim()) {
      toast.error("Node name is required");
      return;
    }

    try {
      await createNode({
        project_id: selectedProject,
        parent_id: selectedParentNode || null,
        name,
        description,
        is_active: true,
      }).unwrap();

      toast.success("Hierarchy node created successfully!");
      setName("");
      setDescription("");
      setSelectedParentNode(null);
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create hierarchy node");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Create Hierarchy Node</h2>

        {/* Loading or Empty Projects */}
        {isLoadingProjects ? (
          <p>Loading projects...</p>
        ) : projects && projects.length === 0 ? (
          <p className="text-red-500">
            ⚠️ No projects found. Please create a project first.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Selection */}
            <div>
              <Label>Select Project</Label>
              <Select
                onValueChange={(val) => {
                  setSelectedProject(val);
                  setSelectedParentNode(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem
                      className="bg-white"
                      key={p.project_id}
                      value={p.project_id}
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parent Node Selection */}
            {selectedProject && (
              <div>
                <Label>Parent Node (optional)</Label>
                {isFetchingParents ? (
                  <p className="text-sm text-gray-500">
                    Loading parent nodes...
                  </p>
                ) : parentNodes?.parentNodes?.length ? (
                  <Select
                    onValueChange={(val) =>
                      setSelectedParentNode(val === "none" ? null : val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent node" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem className="bg-white" value="none">
                        None
                      </SelectItem>
                      {parentNodes.parentNodes.map((node) => (
                        <SelectItem
                          className="bg-white"
                          key={node.hierarchy_node_id}
                          value={node.hierarchy_node_id}
                        >
                          {node.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-500">
                    No parent nodes found — this will be a root node.
                  </p>
                )}
              </div>
            )}

            {/* Node Name */}
            <div>
              <Label>Node Name</Label>
              <Input
                placeholder="Enter node name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Input
                placeholder="Enter node description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingNode}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreatingNode ? "Creating..." : "Create Node"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
