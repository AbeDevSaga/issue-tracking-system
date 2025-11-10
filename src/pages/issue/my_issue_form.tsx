import React, { useState } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import DatePickerField from "../../components/form/input/DatePickerField";
import TimePickerField from "../../components/form/input/TimePickerField";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Alert from "../../components/ui/alert/Alert";

export default function AddIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const editData = state?.issue;
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
const fields = [
  {
    id: "category",
    label: "Select Category",
    type: "select",
    options: [
      { value: "category1", label: "category1" },
      { value: "category2", label: "category2" },
      { value: "category3", label: "category3" },
    ],
  },
  {
    id: "priority_level",
    label: "Priority Level",
    type: "select",
    options: [
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" },
    ],
  },
  { id: "datetime_occurred", label: "When did the issue occur?", type: "datetime" },
  { id: "action_taken", label: "Action Taken", type: "textarea", placeholder: "Actions performed" },
  { id: "url", label: "Add url", type: "url", placeholder: "Paste the url" },
  { id: "description", label: "Description", type: "textarea", placeholder: "Describe the issue" },
  { id: "issue_screenshot", label: "Document Attachment", type: "file" },
];


  const [formValues, setFormValues] = useState<Record<string, any>>(
    fields.reduce((acc, f) => ({ ...acc, [f.id]: editData?.[f.id] ?? "" }), {})
  );

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };



const handleSubmit = (e: React.FormEvent, values: Record<string, any>) => {
  e.preventDefault();

  if (editData) {
    console.log("Updating:", { ...editData, ...values });
    setAlert({ type: "success", message: "Issue updated successfully!" });
  } else {
    console.log("Adding:", values);
    setAlert({ type: "success", message: "Issue added successfully!" });
  }

  setTimeout(() => {
    setAlert(null);
    navigate("/my_issue");
  }, 1500);
};
const handleReset = () => {
  setFormValues(
    fields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {})
  );
};


  const guidelines = [
    {
      title: "Be Specific:",
      description: "Clearly describe what went wrong, when it happened, and what you were trying to do."
    },
    {
      title: "Include Details:",
      description: "Provide error messages, browser/device information, and steps to reproduce the issue."
    },
    {
      title: "Attach Evidence:",
      description: "Screenshots, screen recordings, or log files help our team understand the problem faster."
    },
    {
      title: "Set Correct Severity:",
      description: "Critical = system down, High = major functionality broken, Medium = partial functionality affected, Low = minor inconvenience."
    }
  ];

  return (
    <div className="w-full p-6 bg-gray-50 dark:bg-gray-900 max-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#094C81]">
            {editData ? t("Edit Issue") : t("Add New Issue")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("Please fill in the details below to report or update an issue.")}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-xs">
          <div className="scale-95 shadow-md rounded-md">
            <Alert
              variant={alert.type}
              title={
                <span className="text-sm font-semibold capitalize">
                  {alert.type}
                </span>
              }
              message={<span className="text-xs">{alert.message}</span>}
              showLink={false}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form
  onSubmit={(e) => handleSubmit(e, formValues)}
  className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
>
  {/* Other fields */}
  {fields
    .filter((field) => field.id !== "action_taken") // Hide action_taken from automatic render
    .map((field) => (
      <div key={field.id} className="flex flex-col">
        {field.type === "toggle" ? (
          <Switch
            label={field.label}
            id={field.id}
            checked={!!formValues[field.id]}
            onChange={(val) => handleChange(field.id, val)}
          />
        ) : field.type === "select" ? (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              id={field.id}
              options={field.options || []}
              value={formValues[field.id]}
              onChange={(val) => handleChange(field.id, val)}
            />
          </>
        ) : field.type === "textarea" ? (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <textarea
              id={field.id}
              placeholder={field.placeholder}
              value={formValues[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </>
        ) : field.type === "datetime" ? (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <input
              type="datetime-local"
              id={field.id}
              value={formValues[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </>
        ) : field.type === "file" ? (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <input
              type="file"
              id={field.id}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange(field.id, file);
              }}
              className="w-full border rounded px-4 py-4 text-sm md:text-base bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </>
        ) : (
          <>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              type={field.type as any}
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              value={formValues[field.id]}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
          </>
        )}
      </div>
    ))}

  {/* ✅ Checkbox for showing the Action Taken field */}
  <div className="flex items-center gap-2 md:col-span-2">
    <input
      type="checkbox"
      id="action_taken_checkbox"
      checked={!!formValues.action_taken_checkbox}
      onChange={(e) => handleChange("action_taken_checkbox", e.target.checked)}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <Label htmlFor="action_taken_checkbox">Was any action taken?</Label>
  </div>

  {/* ✅ Conditionally show the Action Taken textarea */}
  {formValues.action_taken_checkbox && (
    <div className="flex flex-col md:col-span-2">
      <Label htmlFor="action_taken">Action Taken</Label>
      <textarea
        id="action_taken"
        placeholder="Describe the actions taken"
        value={formValues.action_taken}
        onChange={(e) => handleChange("action_taken", e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  )}

  <div className="md:col-span-2 flex justify-end gap-4 pt-4">
    <button
      type="button"
      onClick={handleReset}
      className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
    >
      Reset Form
    </button>
    <button
      type="submit"
      className="px-6 py-2 bg-[#094C81] text-white rounded-md hover:bg-blue-800 transition"
    >
      {editData ? "Update Issue" : "Submit Issue"}
    </button>
  </div>
</form>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-[#094C81] mb-2">Issue Reporting Guidelines</h3>
          <p className="text-sm text-[#094C81] mb-4">
            Please follow these guidelines to ensure your issue is addressed quickly and effectively.
          </p>

          <ul className="space-y-3">
            {guidelines.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-[#094C81] flex-shrink-0 mt-1" />
                <div>
                  <span className="font-bold">{item.title}</span>{" "}
                  <span className="text-gray-700 dark:text-gray-200">{item.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
