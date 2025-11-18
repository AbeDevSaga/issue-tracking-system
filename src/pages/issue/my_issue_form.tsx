import React, { useState } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/ui/alert/Alert";
import {
  useCreateIssueMutation,
  useUpdateIssueMutation,
} from "../../redux/services/issueApi";

import { useGetIssueCategoriesQuery } from "../../redux/services/issueCategoryApi";
import { useGetIssuePrioritiesQuery } from "../../redux/services/issuePriorityApi";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { useGetProjectsByUserIdQuery } from "../../redux/services/projectApi";
import { FileUploadField } from "../../components/common/FileUploadField";

export default function AddIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const editData = state?.issue;

  // 🔹 Fetch logged-in user
  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();

  // 🔹 Fetch projects assigned to this user
  const { data: userProjectsResponse, isLoading: projectsLoading } =
    useGetProjectsByUserIdQuery(loggedUser?.user?.user_id ?? "", {
      skip: !loggedUser?.user?.user_id,
      refetchOnMountOrArgChange: true,
    });

  const userProjects =
    userProjectsResponse?.data?.map((assignment: any) => {
      const project = assignment.project;
      return {
        project_user_role_id: assignment.project_user_role_id,
        project_id: project.project_id,
        name: project.name,
        description: project.description,
        is_active: project.is_active,
        hierarchyNode: assignment.hierarchyNode,
        role: assignment.role,
        subRole: assignment.subRole,
        instituteProjects: project.instituteProjects,
      };
    }) ?? [];

  // Fetch Categories & Priorities
  const { data: prioritiesResponse } = useGetIssuePrioritiesQuery();
  const priorities = prioritiesResponse?.data ?? [];

  const { data: categoryResponse } = useGetIssueCategoriesQuery();
  const categories = categoryResponse ?? [];

  // API Mutations for create / update
  const [createIssue] = useCreateIssueMutation();
  const [updateIssue] = useUpdateIssueMutation();

  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  // Form state
  const [formValues, setFormValues] = useState<Record<string, any>>({
    title: "title",
    project_id: editData?.project_id ?? "",
    hierarchy_node_id: editData?.hierarchy_node_id ?? "",
    issue_category_id: editData?.issue_category_id ?? "",
    priority_id: editData?.priority_id ?? "",
    issue_occured_time: editData?.issue_occured_time ?? "",
    url_path: editData?.url_path ?? "",
    description: editData?.description ?? "",
    action_taken: editData?.action_taken ?? "",
    action_taken_checkbox: !!editData?.action_taken,
    attachment_id: editData?.attachment_id
      ? Array.isArray(editData.attachment_id)
        ? editData.attachment_id
        : [editData.attachment_id]
      : [],
    reported_by: loggedUser?.user?.user_id ?? "",
  });

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formValues.title,
      project_id: formValues.project_id,
      hierarchy_node_id: formValues.hierarchy_node_id,
      issue_category_id: formValues.issue_category_id,
      priority_id: formValues.priority_id,
      issue_occured_time: formValues.issue_occured_time,
      description: formValues.description,
      url_path: formValues.url_path,
      action_taken: formValues.action_taken_checkbox
        ? formValues.action_taken
        : null,
      attachment_ids: formValues.attachment_id,
      reported_by: loggedUser?.user?.user_id ?? "",
    };

    try {
      if (editData) {
        await updateIssue({ id: editData.issue_id, data: payload }).unwrap();
        setAlert({ type: "success", message: "Issue updated successfully!" });
      } else {
        await createIssue(payload).unwrap();
        setAlert({ type: "success", message: "Issue added successfully!" });
      }

      setTimeout(() => {
        navigate("/my_issue");
      }, 1500);
    } catch (error: any) {
      setAlert({
        type: "danger",
        message: error?.data?.message || "Something went wrong",
      });
    }
  };

  const handleReset = () => {
    setFormValues({
      title: "title",
      project_id: "",
      issue_category_id: "",
      priority_id: "",
      issue_occured_time: "",
      description: "",
      url_path: "",
      action_taken: "",
      action_taken_checkbox: false,
      attachment_ids: [],
    });
  };

  // Form fields
  const fields = [
    { id: "project_id", label: "Select Project", type: "select" },
    { id: "issue_category_id", label: "Select Category", type: "select" },
    { id: "priority_id", label: "Priority Level", type: "select" },
    {
      id: "issue_occured_time",
      label: "When did the issue occur?",
      type: "datetime",
    },
    { id: "action_taken", label: "Action Taken", type: "textarea" },
    { id: "url_path", label: "Add url", type: "url" },
    { id: "description", label: "Description", type: "textarea" },
  ];

  // Guidelines data
  const guidelines = [
    {
      title: "Be Specific:",
      description:
        "Clearly describe what went wrong, when it happened, and what you were trying to do.",
    },
    {
      title: "Include Details:",
      description:
        "Provide error messages, browser/device information, and steps to reproduce the issue.",
    },
    {
      title: "Attach Evidence:",
      description:
        "Screenshots or logs help our team understand the problem faster.",
    },
    {
      title: "Set Correct Severity:",
      description:
        "Critical = system down, High = major functionality broken, Medium = partial functionality affected, Low = minor issue.",
    },
  ];

  return (
    <div className="w-full p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#094C81]">
            {editData ? t("Edit Issue") : t("Add New Issue")}
          </h2>
          <p className="text-sm text-gray-500">
            Please fill in the details below.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {alert && (
        <div className="fixed top-4 right-4 w-full max-w-xs z-50">
          <Alert
            variant={alert.type === "danger" ? "error" : alert.type}
            title={alert.type === "danger" ? "Error" : alert.type}
            message={alert.message}
            showLink={false}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          {/* Dynamic Fields */}
          {fields
            .filter((f) => f.id !== "action_taken")
            .map((field) => (
              <div key={field.id} className="flex flex-col">
                <Label>{field.label}</Label>

                {field.type === "select" && field.id === "project_id" && (
                  <Select
                    id="project_id"
                    value={formValues.project_id}
                    options={userProjects.map((p) => ({
                      value: p.project_id,
                      label: p.name,
                    }))}
                    onChange={(selectedProjectId) => {
                      const selectedProject = userProjects.find(
                        (p) => p.project_id === selectedProjectId
                      );

                      handleChange("project_id", selectedProjectId);
                      handleChange(
                        "hierarchy_node_id",
                        selectedProject?.hierarchyNode?.hierarchy_node_id ??
                          null
                      );
                    }}
                  />
                )}

                {field.type === "select" &&
                  field.id === "issue_category_id" && (
                    <Select
                      id="issue_category_id"
                      value={formValues.issue_category_id}
                      options={categories.map((c) => ({
                        value: c.category_id,
                        label: c.name,
                      }))}
                      onChange={(v) => handleChange("issue_category_id", v)}
                    />
                  )}

                {field.type === "select" && field.id === "priority_id" && (
                  <Select
                    id="priority_id"
                    value={formValues.priority_id}
                    options={priorities.map((p) => ({
                      value: p.priority_id,
                      label: p.name,
                    }))}
                    onChange={(v) => handleChange("priority_id", v)}
                  />
                )}

                {field.type === "datetime" && (
                  <input
                    type="datetime-local"
                    className="border rounded px-2 py-2"
                    value={formValues.issue_occured_time}
                    onChange={(e) =>
                      handleChange("issue_occured_time", e.target.value)
                    }
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    className="border rounded px-2 py-2"
                    value={formValues[field.id]}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}

                {field.type === "url" && (
                  <Input
                    type="url"
                    value={formValues.url_path}
                    placeholder="Paste the URL"
                    onChange={(e) => handleChange("url_path", e.target.value)}
                  />
                )}
              </div>
            ))}

          {/* Action Taken */}
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={formValues.action_taken_checkbox}
              onChange={(e) =>
                handleChange("action_taken_checkbox", e.target.checked)
              }
            />
            <Label>Was any action taken?</Label>
          </div>

          {formValues.action_taken_checkbox && (
            <div className="md:col-span-2">
              <Label>Action Taken</Label>
              <textarea
                className="border rounded px-3 py-2 w-full"
                value={formValues.action_taken}
                onChange={(e) => handleChange("action_taken", e.target.value)}
              />
            </div>
          )}

          {/* File Upload */}
          <div className="md:col-span-2">
            <FileUploadField
              id="attachment"
              label="Attach File"
              value={formValues.attachment_id}
              onChange={(val) => handleChange("attachment_id", val)}
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-300 rounded"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#094C81] text-white rounded"
            >
              {editData ? "Update Issue" : "Submit Issue"}
            </button>
          </div>
        </form>

        {/* GUIDELINES */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-[#094C81] mb-3">
            Issue Reporting Guidelines
          </h3>
          <ul className="space-y-4">
            {guidelines.map((g, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#094C81] font-bold">{g.title}</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {g.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
