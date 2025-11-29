"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Button } from "../ui/cn/button";
import DatePicker from "react-datepicker";
import { useCreateProjectMutation } from "../../redux/services/projectApi";
import { XIcon, CalendarIcon, Check, Square } from "lucide-react";
import { Textarea } from "../ui/cn/textarea";

// Import react-datepicker styles
import "react-datepicker/dist/react-datepicker.css";
import { useGetProjectMetricsQuery } from "../../redux/services/projectMetricApi";

interface CreateProjectModalProps {
  instituteId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectMetric {
  project_metric_id: string;
  name: string;
  description: string;
  weight: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  projects: any[];
  users: any[];
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
  const [projectMetricsIds, setProjectMetricsIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [createProject, { isLoading }] = useCreateProjectMutation();
  const {
    data: metricsData,
    isLoading: loadingMetrics,
    isError,
  } = useGetProjectMetricsQuery({});

  const metrics: ProjectMetric[] = metricsData || [];

  // Update selectAll state based on current selection
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectAll(projectMetricsIds.length === metrics.length);
    }
  }, [projectMetricsIds, metrics]);

  const handleMetricSelect = (metricId: string) => {
    setProjectMetricsIds((prev) => {
      if (prev.includes(metricId)) {
        return prev.filter((id) => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setProjectMetricsIds([]);
      setSelectAll(false);
    } else {
      // Select all
      const allMetricIds = metrics.map((metric) => metric.project_metric_id);
      setProjectMetricsIds(allMetricIds);
      setSelectAll(true);
    }
  };

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
      project_metrics_ids:
        projectMetricsIds.length > 0 ? projectMetricsIds : undefined,
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
    setProjectMetricsIds([]);
    setSelectAll(false);
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
        <div className="flex flex-col gap-6">
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
          {/* Bottom Panel: Project Metrics Selection */}

          <div className="w-full border flex flex-col gap-6 p-4 shadow-md rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-[#094C81] font-semibold text-lg ">
                Project Metrics
              </h3>
              <>
                {/* Global Select All Checkbox */}
                <div
                  className="flex items-center gap-3 p-3  hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={handleSelectAll}
                >
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                      selectAll
                        ? "bg-[#094C81] border-[#094C81] text-white"
                        : "border-gray-300 text-transparent"
                    }`}
                  >
                    {selectAll ? <Check className="w-3 h-3" /> : null}
                  </div>
                  <span className="font-medium text-[#094C81]">
                    Select All Metrics
                  </span>
                </div>
              </>
            </div>

            {loadingMetrics ? (
              <div className="text-center py-4 text-gray-500">
                Loading metrics...
              </div>
            ) : isError ? (
              <div className="text-center py-4 text-red-500">
                Failed to load metrics
              </div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No metrics available
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {/* Metrics List */}
                {metrics.map((metric) => (
                  <div
                    key={metric.project_metric_id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleMetricSelect(metric.project_metric_id)}
                  >
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        projectMetricsIds.includes(metric.project_metric_id)
                          ? "bg-[#094C81] border-[#094C81] text-white"
                          : "border-gray-300 text-transparent"
                      }`}
                    >
                      {projectMetricsIds.includes(metric.project_metric_id) ? (
                        <Check className="w-3 h-3" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {metric.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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
