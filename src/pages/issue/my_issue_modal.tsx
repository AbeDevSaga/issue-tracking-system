import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Switch from "../../components/form/switch/Switch";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface Field {
  id: string;
  label: string;
  type: "text" | "email" | "password" | "toggle" | "select" | "textarea" | "date" | "time" | "file";
  placeholder?: string;
  options?: { value: string; label: string }[];
  value?: any;
}

interface AddMyIssueProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  fields?: Field[];
}

export default function AddIssueCategory({ onClose, onSubmit, fields }: AddMyIssueProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  const [formValues, setFormValues] = useState<Record<string, any>>(
    fields?.reduce((acc, f) => ({ ...acc, [f.id]: f.value ?? "" }), {}) || {}
  );

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (onSubmit) onSubmit(formValues);
  if (currentStep === steps.length) {
    onClose();
  }
};


  const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Details" },
    { id: 3, label: "Confirmation" },
  ];

  const stepFields: Record<number, string[]> = {
    1: ["category", "priority_level", "created_date", "created_time", "description", "action_taken"],
    2: ["url", "issue_screenshot"],
    3: [], // Step 3: show all fields for review
  };

  // fields to render in this step
  const visibleFields = currentStep === 3
    ? fields
    : fields?.filter(f => stepFields[currentStep]?.includes(f.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl p-6 shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white">✕</button>

        <h2 className="text-xl text-[#094C81] font-semibold mb-2">{t("issue_category.add_issue_category")}</h2>
        <h6 className="text-sm text-[#094C81] mb-4">{t("issue_category.modal_title")}</h6>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -z-10"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-[#094C81] rounded-full transition-all duration-500 -z-10"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map(step => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.id ? "bg-[#094C81] border-[#094C81] text-white" : "border-gray-300 text-gray-400 bg-white"
              }`}>{step.id}</div>
              <span className={`text-sm mt-2 ${currentStep >= step.id ? "text-[#094C81] font-medium" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className={`grid gap-6 ${currentStep === 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {visibleFields?.map(field => (
              <div key={field.id} className="flex flex-col">
                {currentStep === 3 ? (
                  // REVIEW PAGE
                  <>
                    <Label>{field.label}</Label>
                    <div className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      {field.type === "toggle" ? (formValues[field.id] ? "Yes" : "No")
                        : field.type === "select" ? field.options?.find(o => o.value === formValues[field.id])?.label || formValues[field.id]
                        : formValues[field.id]}
                    </div>
                  </>
                ) : field.type === "toggle" ? (
                  <Switch
                    label={field.label}
                    id={field.id}
                    checked={formValues[field.id] ?? false}
                    onChange={val => handleChange(field.id, val)}
                  />
                ) : field.type === "select" ? (
                  <>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Select
                      id={field.id}
                      options={field.options || []}
                      value={formValues[field.id]}
                      onChange={val => handleChange(field.id, val)}
                    />
                  </>
                ) : field.type === "textarea" ? (
                  <>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <textarea
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      value={formValues[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      value={formValues[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              className={`px-4 py-2 rounded-md transition ${
                currentStep === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              Back
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length))}
                className="px-4 py-2 bg-[#094C81] text-white rounded-md hover:bg-blue-800 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-[#094C81] text-white rounded-md hover:bg-blue-800 transition"
              >
                Submit
              </button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
