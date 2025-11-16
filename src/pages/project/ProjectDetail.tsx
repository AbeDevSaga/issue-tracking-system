// src/pages/project/ProjectDetail.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/cn/card";
import { Button } from "../../components/ui/cn/button";
import {
  useGetProjectByIdQuery,
  useAssignUserToProjectMutation,
} from "../../redux/services/projectApi";
import { useGetUsersQuery } from "../../redux/services/userApi";
import { useGetRolesQuery } from "../../redux/services/roleApi";
import { useGetParentNodesQuery } from "../../redux/services/hierarchyNodeApi";
import ProjectUserRolesTable from "../../components/tables/lists/ProjectUserRolesTable";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useGetProjectByIdQuery(id!);
  const { data: usersResponse } = useGetUsersQuery();
  const { data: rolesResponse } = useGetRolesQuery(undefined);
  const [assignUserToProject] = useAssignUserToProjectMutation();

  const {
    data: structuresResponse,
    isLoading: loadingStructures,
    isError: errorStructures,
  } = useGetParentNodesQuery(id!);

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [subRole, setSubRole] = useState<string>("");
  const [structureId, setStructureId] = useState<string>("");

  // State for nested structure navigation
  const [currentNodes, setCurrentNodes] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<any[]>([]);

  useEffect(() => {
    if (structuresResponse?.nodes) {
      setCurrentNodes(structuresResponse.nodes);
    }
  }, [structuresResponse]);

  if (isLoading) return <p>Loading project...</p>;
  if (isError || !project) return <p>Project not found.</p>;

  const users = usersResponse?.data || [];
  const roles = rolesResponse?.data || [];
  const structures = structuresResponse?.nodes || [];

  console.log("structures: ", structures);

  const selectedRoleData = roles.find((r: any) => r.role_id === selectedRole);
  const subRoles = selectedRoleData?.roleSubRoles || [];

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) {
      alert("Please select user and role.");
      return;
    }

    try {
      await assignUserToProject({
        project_id: project.project_id,
        user_id: selectedUser,
        role_id: selectedRole,
        sub_role_id: subRole || undefined,
        hierarchy_node_id: structureId || "",
      }).unwrap();

      alert("User assigned successfully");
      setSelectedUser("");
      setSelectedRole("");
      setSubRole("");
      setStructureId("");
      setCurrentNodes(structures);
      setCurrentPath([]);
    } catch (error: any) {
      alert("Error: " + (error.data?.message || error.message));
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* === Project Info === */}
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Description:</strong> {project.description || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {project.is_active ? "Active" : "Inactive"}
          </p>
          {project.institutes?.length > 0 && (
            <p>
              <strong>Institutes:</strong>{" "}
              {project.institutes.map((i: any) => i.name).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* === Assigned Users === */}

      <ProjectUserRolesTable projectId={project.project_id} />

      {/* === Assign User Section === */}
      <Card>
        <CardHeader>
          <CardTitle>Assign User to Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col space-y-2">
            {/* User Selection */}
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select User</option>
              {users.map((u: any) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.full_name} ({u.email})
                </option>
              ))}
            </select>

            {/* Role Selection */}
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSubRole("");
              }}
              className="border p-2 rounded"
            >
              <option value="">Select Role</option>
              {roles.map((r: any) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Sub-Role Selection */}
            {selectedRole && (
              <select
                value={subRole}
                onChange={(e) => setSubRole(e.target.value)}
                className="border p-2 rounded"
                disabled={subRoles.length === 0}
              >
                {subRoles.length > 0 ? (
                  <>
                    <option value="">Select Sub-Role</option>
                    {subRoles.map((sr: any) => (
                      <option
                        key={sr.roles_sub_roles_id}
                        value={sr.sub_role_id}
                      >
                        {sr.subRole?.name}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">No sub-roles available</option>
                )}
              </select>
            )}

            {/* Structure Navigation */}
            <div className="border p-2 rounded space-y-2">
              <label className="font-medium">Select Structure</label>
              {loadingStructures ? (
                <p>Loading structures...</p>
              ) : errorStructures ? (
                <p>Error loading structures</p>
              ) : (
                <>
                  {currentPath.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                          const newPath = [...currentPath];
                          newPath.pop();
                          setCurrentPath(newPath);
                          setCurrentNodes(
                            newPath.length === 0
                              ? structures
                              : newPath[newPath.length - 1].children
                          );
                        }}
                      >
                        &larr; Back
                      </button>
                      <span className="text-gray-500">
                        {currentPath.map((n: any) => n.name).join(" / ")}
                      </span>
                    </div>
                  )}

                  <ul className="border rounded p-2 max-h-40 overflow-auto space-y-1">
                    {currentNodes.map((node: any) => (
                      <li
                        key={node.hierarchy_node_id}
                        className="flex justify-between items-center"
                      >
                        <span>{node.name}</span>
                        <div className="space-x-2">
                          {node.children && node.children.length > 0 && (
                            <button
                              className="text-sm text-blue-600 hover:underline"
                              onClick={() => {
                                setCurrentPath([...currentPath, node]);
                                setCurrentNodes(node.children);
                              }}
                            >
                              Open
                            </button>
                          )}
                          <input
                            type="radio"
                            name="structure"
                            value={node.hierarchy_node_id}
                            checked={structureId === node.hierarchy_node_id}
                            onChange={() =>
                              setStructureId(node.hierarchy_node_id)
                            }
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <Button onClick={handleAssign}>Assign User</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <Link to="/project">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    </div>
  );
}
