"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";
import {
  useCreateProjectMetricMutation,
  useUpdateProjectMetricMutation,
} from "../../redux/services/projectMetricApi";

interface CreateProjectMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMetric?: any; // optional: existing metric for edit
}

export const CreateProjectMetricModal: React.FC<
  CreateProjectMetricModalProps
> = ({ isOpen, onClose, editingMetric }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [createProjectMetric, { isLoading: isCreating }] =
    useCreateProjectMetricMutation();
  const [updateProjectMetric, { isLoading: isUpdating }] =
    useUpdateProjectMetricMutation();
  const nameRegex = /^[A-Za-z\s]*$/;

  // Populate form when editing
  useEffect(() => {
    if (editingMetric) {
      setName(editingMetric.name || "");
      setDescription(editingMetric.description || "");
    } else if (!isOpen) {
      setName("");
      setDescription("");
    }
  }, [editingMetric, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please provide a metric name");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      toast.error("Name must contain only letters and spaces");
      return;
    }
    const payload = {
      name,
      description: description || "",
      is_active: true,
    };

    try {
      if (editingMetric) {
        await updateProjectMetric({
          id: editingMetric.project_metric_id,
          ...payload,
        }).unwrap();
        toast.success("Project human resource updated successfully!");
      } else {
        await createProjectMetric(payload).unwrap();
        toast.success("Project human resource created successfully!");
      }
      onClose();
      setName("");
      setDescription("");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Operation failed. Please try again."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[400px] shadow-2xl transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            {editingMetric
              ? "Edit Project Human Resource"
              : "Create Project Human Resource"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label>
              Human Resource Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                const value = e.target.value;

                if (nameRegex.test(value)) {
                  setName(value);
                }
              }}
              placeholder="Enter human resource name"
              className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {editingMetric
              ? isUpdating
                ? "Updating..."
                : "Update"
              : isCreating
              ? "Creating..."
              : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};
