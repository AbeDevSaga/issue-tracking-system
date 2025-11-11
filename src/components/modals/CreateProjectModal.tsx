"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/cn/select";

import { useCreateProjectMutation } from "../../redux/services/projectApi";
import { useGetInstitutesQuery } from "../../redux/services/instituteApi";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [instituteId, setInstituteId] = useState<string>("");

  const { data: institutes, isLoading: loadingInstitutes } =
    useGetInstitutesQuery();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please provide a project name");
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      is_active: isActive,
      institute_id: instituteId || undefined,
    };

    try {
      await createProject(payload).unwrap();
      toast.success("Project created successfully!");
      onClose();

      // Reset form
      setName("");
      setDescription("");
      setIsActive(true);
      setInstituteId("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create project");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project A"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
            />
          </div>

          <div>
            <Label>Assign to Institute</Label>
            <Select
              value={instituteId}
              onValueChange={setInstituteId}
              disabled={loadingInstitutes}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Institute (optional)" />
              </SelectTrigger>
              <SelectContent>
                {institutes?.map((inst) => (
                  <SelectItem key={inst.institute_id} value={inst.institute_id}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(val) => setIsActive(val === "active")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
