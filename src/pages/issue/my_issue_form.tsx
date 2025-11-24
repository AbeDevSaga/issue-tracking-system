import React, { useState } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
// import Select from "../../components/form/Select";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/ui/alert/Alert";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/cn/select";

import {
  useCreateIssueMutation,
  useUpdateIssueMutation,
} from "../../redux/services/issueApi";

import { useGetIssueCategoriesQuery } from "../../redux/services/issueCategoryApi";
import { useGetIssuePrioritiesQuery } from "../../redux/services/issuePriorityApi";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { useGetProjectsByUserIdQuery } from "../../redux/services/projectApi";
import { FileUploadField } from "../../components/common/FileUploadField";
import DetailHeader from "../../components/common/DetailHeader";
import TextArea from "../../components/form/input/TextArea";
import { format } from "date-fns";

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
      label: "Date and Time Issue Happened",
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
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#094C81]">Add New Issue</h2>
        <DetailHeader breadcrumbs={[]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          {/* Dynamic Fields */}
          {fields
            .filter((f) => f.id !== "action_taken")
            .map((field) => (
              <div key={field.id} className="flex h-fit flex-col w-full">
                <Label className="text-sm font-medium text-[#094C81]">
                  {field.label}
                </Label>

                {field.type === "select" && field.id === "project_id" && (
                  <Select
                    value={formValues.project_id}
                    onValueChange={(selectedProjectId) => {
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
                  >
                    <SelectTrigger className="w-full border h-10 border-gray-300 bg-white p-2 rounded mt-1 text-[#094C81]">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>

                    <SelectContent className="text-[#094C81] *: bg-white">
                      {userProjects.map((p) => (
                        <SelectItem key={p.project_id} value={p.project_id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "select" &&
                  field.id === "issue_category_id" && (
                    <Select
                      value={formValues.issue_category_id}
                      onValueChange={(v) =>
                        handleChange("issue_category_id", v)
                      }
                    >
                      <SelectTrigger className="w-full h-10 border border-gray-300 bg-white p-2 rounded mt-1 text-[#094C81]">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>

                      <SelectContent className="text-[#094C81] *: bg-white">
                        {categories.map((c) => (
                          <SelectItem key={c.category_id} value={c.category_id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                {field.type === "select" && field.id === "priority_id" && (
                  <Select
                    value={formValues.priority_id}
                    onValueChange={(v) => handleChange("priority_id", v)}
                  >
                    <SelectTrigger className="w-full h-10 border border-gray-300 bg-white p-2 rounded mt-1 text-[#094C81]">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>

                    <SelectContent className="text-[#094C81] *: bg-white">
                      {priorities.map((p) => (
                        <SelectItem key={p.priority_id} value={p.priority_id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "datetime" && (
                  <Input
                    id="issue_occured_time"
                    defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    type="datetime-local"
                    className="border text-[#094C81] h-10 max-w-[350px] rounded px-2 py-2"
                    value={formValues.issue_occured_time}
                    onChange={(e) =>
                      handleChange("issue_occured_time", e.target.value)
                    }
                  />
                )}

                {field.type === "textarea" && (
                  <TextArea
                    rows={2}
                    placeholder="Enter your action taken"
                    className="border max-w-[350px] rounded px-2 py-2"
                    value={formValues[field.id]}
                    onChange={(e) => handleChange(field.id, e)}
                  />
                )}

                {field.type === "url" && (
                  <Input
                    type="url"
                    placeholder="Paste the URL"
                    value={formValues.url_path}
                    onChange={(e) => handleChange("url_path", e.target.value)}
                    className="border h-10 max-w-[350px] rounded px-2 py-2 text-[#094C81]"
                  />
                )}
              </div>
            ))}

          {/* Action Taken */}
          <div className=" w-full col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex w-full grid-cols-1 flex-col gap-4">
              <div className="flex w-fit gap-2 ">
                <input
                  type="checkbox"
                  className="border border-gray-300 bg-white rounded px-2 py-2 text-[#094C81] h-5 w-5"
                  checked={formValues.action_taken_checkbox}
                  onChange={(e) =>
                    handleChange("action_taken_checkbox", e.target.checked)
                  }
                />
                <Label className="text-sm text-start w-fit font-medium text-[#094C81]">
                  Was any action taken?
                </Label>
              </div>

              {formValues.action_taken_checkbox && (
                <div className="w-full flex flex-col gap-2">
                  <Label className="text-sm  text-start font-medium text-[#094C81]">
                    Action Taken
                  </Label>
                  <TextArea
                    rows={3}
                    placeholder="Enter your action taken"
                    className="border w-full max-w-[350px] rounded px-2 py-2"
                    value={formValues.action_taken}
                    onChange={(e) => handleChange("action_taken", e)}
                  />
                </div>
              )}
            </div>
            {/* File Upload */}
            <div className="w-full grid-cols-1 max-w-[350px]">
              <FileUploadField
                className=""
                labelClass="text-sm  text-start w-fit font-medium text-[#094C81]"
                id="attachment"
                label="Attach File"
                value={formValues.attachment_id}
                onChange={(val) => handleChange("attachment_id", val)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded"
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#094C81] mb-2">
              Issue Reporting Guidelines
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Follow these tips to help us resolve your issue faster
            </p>
          </div>
          <div className="space-y-4">
            {guidelines.map((g, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 border-l-4 border-[#094C81] hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-[#094C81] flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-[#094C81] mb-1.5">
                    {g.title}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {g.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
