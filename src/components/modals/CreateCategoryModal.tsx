"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import { Textarea } from "../ui/cn/textarea";
import { useCreateIssueCategoryMutation } from "../../redux/services/issueCategoryApi";
import { XIcon } from "lucide-react";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [createCategory, { isLoading }] = useCreateIssueCategoryMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await createCategory(formData).unwrap();
      toast.success(`Support request category created successfully`);
      setFormData({ name: "", description: "" });
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to create support request category. Please try again."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">Create Support Request Category</h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div className="space-y-4 flex-col flex w-full ">
          <div className="">
            <Label htmlFor="name" className="block text-sm text-[#094C81] font-medium mb-2">Support Request Category Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter support request category name"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

          <div className="">
            <Label htmlFor="description" className="block text-sm text-[#094C81] font-medium mb-2">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter short description (optional)"
              value={formData.description}
              onChange={handleChange}
              className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};