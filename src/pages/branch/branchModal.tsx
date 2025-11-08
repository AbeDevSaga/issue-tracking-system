import React, { useState } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

interface Option {
  value: string;
  label: string;
}

interface Field {
  id: string;
  label: string;
  type: "text" | "select" | "textarea";
  placeholder?: string;
  options?: Option[];
  value?: any;
}

interface AddBranchProps {
  onClose: () => void;
  onSubmit?: (values: Record<string, any>) => void;
  hierarchies: { id: string; hierarchy_name: string; parent_hierarchy_id?: string }[];
  fields: Field[];
}

export default function AddBranch({ onClose, onSubmit, hierarchies, fields }: AddBranchProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(
    fields?.reduce((acc, f) => ({ ...acc, [f.id]: f.value ?? "" }), {}) || {}
  );

  // Track selected hierarchy levels for dependent dropdown
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    formValues.hierarchy_id ? [formValues.hierarchy_id] : [""]
  );

  const handleChange = (id: string, value: any) => {
    if (id === "hierarchy_id") {
      const newLevels = selectedLevels.slice(0, 1);
      newLevels[0] = value;
      const children = hierarchies.filter((h) => h.parent_hierarchy_id === value);
      if (children.length > 0) newLevels.push("");
      setSelectedLevels(newLevels);
    } else {
      setFormValues((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleLevelChange = (index: number, value: string) => {
    const newLevels = selectedLevels.slice(0, index + 1);
    newLevels[index] = value;
    const children = hierarchies.filter((h) => h.parent_hierarchy_id === value);
    if (children.length > 0) newLevels.push("");
    setSelectedLevels(newLevels);
    setFormValues((prev) => ({ ...prev, hierarchy_id: newLevels.filter(Boolean).slice(-1)[0] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      ...formValues,
      hierarchy_id: selectedLevels.filter(Boolean).slice(-1)[0],
    });
    onClose();
  };

  const getChildren = (parentId?: string) =>
    hierarchies.filter((h) => h.parent_hierarchy_id === parentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl p-6 shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white">✕</button>

        <h2 className="text-xl text-[#094C81] font-semibold mb-2">Add Branch</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => {
            // Handle dependent hierarchy
            if (field.id === "hierarchy_id") {
              return selectedLevels.map((level, idx) => {
                const parentId = idx === 0 ? undefined : selectedLevels[idx - 1];
                const children = getChildren(parentId);
                if (children.length === 0) return null;

                return (
                  <div key={idx}>
                    <Label>{field.label} - Level {idx + 1}</Label>
                    <Select
                      value={level}
                      options={children.map((c) => ({ value: c.id, label: c.hierarchy_name }))}
                      placeholder="Select..."
                      onChange={(val) => handleLevelChange(idx, val)}
                    />
                  </div>
                );
              });
            }

            if (field.type === "select") {
              return (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Select
                    id={field.id}
                    value={formValues[field.id]}
                    options={field.options || []}
                    placeholder={field.placeholder}
                    onChange={(val) => handleChange(field.id, val)}
                  />
                </div>
              );
            } else if (field.type === "textarea") {
              return (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formValues[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              );
            } else {
              return (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    type={field.type}
                    id={field.id}
                    value={formValues[field.id]}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                </div>
              );
            }
          })}

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
