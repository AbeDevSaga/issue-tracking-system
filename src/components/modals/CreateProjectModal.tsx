"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import DatePicker from "react-datepicker";
import { useCreateProjectMutation } from "../../redux/services/projectApi";
import { XIcon, CalendarIcon } from "lucide-react";
import { Textarea } from "../ui/cn/textarea";

// Import react-datepicker styles
import "react-datepicker/dist/react-datepicker.css";

interface CreateProjectModalProps {
  instituteId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  instituteId,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [maintenanceStart, setMaintenanceStart] = useState<Date | null>(null);
  const [maintenanceEnd, setMaintenanceEnd] = useState<Date | null>(null);

  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please provide a project name");
      return;
    }

    if (
      maintenanceStart &&
      maintenanceEnd &&
      maintenanceStart > maintenanceEnd
    ) {
      toast.error("Maintenance start date cannot be later than end date");
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      is_active: isActive,
      institute_id: instituteId || undefined,
      maintenance_start: maintenanceStart
        ? maintenanceStart.toISOString().split("T")[0]
        : undefined,
      maintenance_end: maintenanceEnd
        ? maintenanceEnd.toISOString().split("T")[0]
        : undefined,
    };

    try {
      await createProject(payload).unwrap();
      toast.success("Project created successfully!");
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create project");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setMaintenanceStart(null);
    setMaintenanceEnd(null);
    setIsActive(true);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Custom input component for DatePicker to match your design
  const CustomDateInput = React.forwardRef<HTMLButtonElement, any>(
    ({ value, onClick }, ref) => (
      <button
        type="button"
        className="w-full min-w-[330px] h-12 border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none flex items-center justify-between bg-white text-left"
        onClick={onClick}
        ref={ref}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || "Select date"}
        </span>
        <CalendarIcon className="w-4 h-4 text-gray-500" />
      </button>
    )
  );
  CustomDateInput.displayName = "CustomDateInput";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[800px] shadow-2xl transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#094C81]">
            Create Project
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <div className="flex w-full gap-4">
          {/* Left Panel: Project Info (without title) */}
          
          <div className="w-1/2 border flex flex-col gap-6 p-4 shadow-md rounded-md">
          <h3 className="text-[#094C81] font-semibold text-lg ">
             Project Info
            </h3>
            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>

            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Description
              </Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description"
                className="w-full min-h-[40px] max-w-[350px] border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {/* Right Panel: Maintenance Timeline (keep title) */}
          <div className="w-1/2 border flex flex-col gap-6 p-4 shadow-md rounded-md">
            <h3 className="text-[#094C81] font-semibold text-lg ">
              Maintenance and Support Timeline
            </h3>

            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                Start Date
              </Label>
              <DatePicker
                selected={maintenanceStart}
                onChange={(date) => setMaintenanceStart(date)}
                selectsStart
                startDate={maintenanceStart}
                endDate={maintenanceEnd}
                customInput={<CustomDateInput />}
                placeholderText="Select start date"
                dateFormat="MMMM d, yyyy"
              />
            </div>

            <div className="w-full">
              <Label className="block text-sm text-[#094C81] font-medium mb-2">
                End Date
              </Label>
              <DatePicker
                selected={maintenanceEnd}
                onChange={(date) => setMaintenanceEnd(date)}
                selectsEnd
                startDate={maintenanceStart}
                endDate={maintenanceEnd}
                minDate={maintenanceStart || new Date()}
                customInput={<CustomDateInput />}
                placeholderText="Select end date"
                dateFormat="MMMM d, yyyy"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
          
          onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
};
