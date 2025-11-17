"use client";

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/cn/card";

import { useGetProjectByIdQuery } from "../../redux/services/projectApi";
import ProjectUserRolesTable from "../../components/tables/lists/ProjectUserRolesTable";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useGetProjectByIdQuery(id!);

  if (isLoading) return <p>Loading project...</p>;
  if (isError || !project) return <p>Project not found.</p>;

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

      {/* Assigned Users */}
      <ProjectUserRolesTable projectId={project.project_id} />

    </div>
  );
}
