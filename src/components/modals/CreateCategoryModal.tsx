"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import { Textarea } from "../ui/cn/textarea";
import {
  useCreateIssueCategoryMutation,
  useUpdateIssueCategoryMutation,
} from "../../redux/services/issueCategoryApi";
import { XIcon } from "lucide-react";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: any; // optional for edit mode
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  editingCategory,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateIssueCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateIssueCategoryMutation();

  // Populate form when editing
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || "",
      });
    } else if (!isOpen) {
      setFormData({ name: "", description: "" });
    }
  }, [editingCategory, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Only allow letters and spaces for the name field
    if (name === "name") {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.category_id,
          data: formData,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(formData).unwrap();
        toast.success("Category created successfully");
      }
      setFormData({ name: "", description: "" });
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Operation failed. Please try again."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            {editingCategory
              ? "Edit Support Request Category"
              : "Create Support Request Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div className="space-y-4 flex-col flex w-full">
          <div>
            <Label htmlFor="name">Support Request Category Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter short description (optional)"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {editingCategory
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
