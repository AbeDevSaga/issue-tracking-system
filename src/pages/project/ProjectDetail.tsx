// src/pages/project/ProjectDetail.tsx
"use client";

import React, { useState } from "react";
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

  if (isLoading) return <p>Loading project...</p>;
  if (isError || !project) return <p>Project not found.</p>;

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
        hierarchy_node_id: structureId || null,
      }).unwrap();

      alert("User assigned successfully");
      setSelectedUser("");
      setSelectedRole("");
      setSubRole("");
      setStructureId("");
    } catch (error: any) {
      alert("Error: " + (error.data?.message || error.message));
    }
  };

  const users = usersResponse?.data || [];
  const roles = rolesResponse?.data || [];
  const structures = structuresResponse?.parentNodes || [];

  // Get sub-roles for selected role
  const selectedRoleData = roles.find((r: any) => r.role_id === selectedRole);
  const subRoles = selectedRoleData?.roleSubRoles || [];

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
      {project.projectUserRoles?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">User</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Role</th>
                  <th className="border p-2">Structure</th>
                </tr>
              </thead>
              <tbody>
                {project.projectUserRoles.map((pur: any) => (
                  <tr key={pur.project_user_role_id}>
                    <td className="border p-2">{pur.user?.full_name}</td>
                    <td className="border p-2">{pur.user?.email}</td>
                    <td className="border p-2">{pur.role?.name}</td>
                    <td className="border p-2">
                      {pur.hierarchyNode ? pur.hierarchyNode.name : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

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

            {/* Structure Selection */}
            <select
              value={structureId}
              onChange={(e) => setStructureId(e.target.value)}
              className="border p-2 rounded"
              disabled={loadingStructures || errorStructures}
            >
              {loadingStructures ? (
                <option>Loading structures...</option>
              ) : errorStructures ? (
                <option>Error loading structures</option>
              ) : (
                <>
                  <option value="">Select Structure</option>
                  {structures.map((s: any) => (
                    <option
                      key={s.hierarchy_node_id}
                      value={s.hierarchy_node_id}
                    >
                      {s.name}
                    </option>
                  ))}
                </>
              )}
            </select>

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
