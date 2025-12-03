"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { useCreateIssueResponseTimeMutation } from "../../redux/services/issueResponseTimeApi";
import { XIcon } from "lucide-react";

// Strongly typed unit values
type ResponseUnit = "hour" | "day" | "month";

interface CreateResponseTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const responseTimeUnitOptions: { label: string; value: ResponseUnit }[] = [
  { label: "Hour", value: "hour" },
  { label: "Day", value: "day" },
  { label: "Month", value: "month" },
];

export const CreateResponseTimeModal: React.FC<
  CreateResponseTimeModalProps
> = ({ isOpen, onClose }) => {
  const [duration, setDuration] = useState<number>(0);
  const [unit, setUnit] = useState<ResponseUnit>("hour");
  const [createResponseTime, { isLoading }] =
    useCreateIssueResponseTimeMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!duration || duration <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    // Validate unit is one of the enum options
    if (!["hour", "day", "month"].includes(unit)) {
      toast.error("Invalid unit selected");
      return;
    }

    try {
      // Type assertion ensures TypeScript accepts the correct union type
      await createResponseTime({
        duration,
        unit: unit as ResponseUnit,
      }).unwrap();
      toast.success("Response time created successfully");
      setDuration(0);
      setUnit("hour");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create response time");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create New Response Time
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col w-full"
        >
          {/* Duration */}
          <div className="flex flex-col w-full">
            <Label
              htmlFor="duration"
              className="block text-sm text-[#094C81] font-medium mb-2"
            >
              Duration
            </Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="Enter numeric duration"
              required
              className="w-full h-11 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Unit */}
          <div className="flex flex-col w-full">
            <Label
              htmlFor="unit"
              className="block text-sm text-[#094C81] font-medium mb-2"
            >
              Unit
            </Label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => {
                const selected = e.target.value;
                if (["hour", "day", "month"].includes(selected)) {
                  setUnit(selected as ResponseUnit);
                }
              }}
              className="w-full h-11 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent outline-none transition-all duration-200"
            >
              {responseTimeUnitOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
