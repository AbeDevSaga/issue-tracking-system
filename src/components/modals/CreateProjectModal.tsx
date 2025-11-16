"use client";

import React, { useState } from "react";
import { toast } from "sonner";
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
import { XIcon } from "lucide-react";
import { Textarea } from "../ui/cn/textarea";

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
      setName("");
      setDescription("");
      setIsActive(true);
      setInstituteId("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create project");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[700px] shadow-2xl transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create Project
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div className="space-y-4 mt-2 flex w-full gap-10">
          <div className="w-1/2 flex flex-col gap-4">
            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>

            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">Description</Label>
              <Textarea
                rows={4}  
                className="max-w-[300px] h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description"
              />
            </div>
          </div>

          <div className="w-1/2 flex">
            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">Assign to Institute</Label>
              <Select
                value={instituteId}
                onValueChange={setInstituteId}
                disabled={loadingInstitutes}
              >
                <SelectTrigger className=" h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
                  <SelectValue className="text-sm text-[#094C81] font-medium" placeholder="Select Institute (optional)" />
                </SelectTrigger>
                <SelectContent className="text-sm text-[#094C81] font-medium">
                  {institutes?.map((inst) => (
                    <SelectItem
                      className="text-sm text-[#094C81] font-medium"
                      key={inst.institute_id}
                      value={inst.institute_id}
                    >
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div>
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
            </div> */}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
};
