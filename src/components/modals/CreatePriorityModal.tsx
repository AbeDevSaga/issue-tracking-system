"use client";

import React, { useState } from "react";
import { toast } from "sonner"; // optional, for notifications
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/cn/dialog";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { useCreateIssuePriorityMutation } from "../../redux/services/issuePriorityApi";

interface CreatePriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePriorityModal: React.FC<CreatePriorityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [createPriority, { isLoading }] = useCreateIssuePriorityMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Priority name is required");
      return;
    }

    try {
      await createPriority({ name, description }).unwrap();
      toast.success("Priority created successfully");
      setName("");
      setDescription("");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create priority");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Create New Priority</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="priority-name">Priority Name</Label>
            <Input
              id="priority-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter priority name"
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <Label htmlFor="priority-description">Description</Label>
            <Input
              id="priority-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
            />
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Priority"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
