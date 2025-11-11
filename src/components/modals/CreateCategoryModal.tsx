"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/cn/dialog";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import { Textarea } from "../ui/cn/textarea";
import { useCreateIssueCategoryMutation } from "../../redux/services/issueCategoryApi";

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await createCategory(formData).unwrap();
      toast.success(`Category "${response.name}" created successfully`);
      setFormData({ name: "", description: "" });
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to create issue category. Please try again."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Create Issue Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Category Name</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
