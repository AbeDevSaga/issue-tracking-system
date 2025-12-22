"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { Textarea } from "../ui/cn/textarea";
import { XIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "../ui/cn/select";
import {
  useCreateIssuePriorityMutation,
  useUpdateIssuePriorityMutation,
} from "../../redux/services/issuePriorityApi";
import { useGetIssueResponseTimesQuery } from "../../redux/services/issueResponseTimeApi";

interface CreatePriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPriority?: any; // optional for edit mode
}

export const CreatePriorityModal: React.FC<CreatePriorityModalProps> = ({
  isOpen,
  onClose,
  editingPriority,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [color, setColor] = useState("#aabbcc");
  const [escalate, setEscalate] = useState(false);

  const [createPriority, { isLoading: isCreating }] =
    useCreateIssuePriorityMutation();
  const [updatePriority, { isLoading: isUpdating }] =
    useUpdateIssuePriorityMutation();

  const { data: responseTimesData, isLoading: isResponseTimesLoading } =
    useGetIssueResponseTimesQuery();

  // Populate form for editing
  useEffect(() => {
    if (editingPriority) {
      setName(editingPriority.name);
      setDescription(editingPriority.description || "");
      setResponseTime(editingPriority.response_time_id || "");
      setColor(editingPriority.color_value);
      setEscalate(editingPriority.is_active);
    } else if (!isOpen) {
      // Reset on modal close
      setName("");
      setDescription("");
      setResponseTime("");
      setColor("#aabbcc");
      setEscalate(false);
    }
  }, [editingPriority, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Priority name is required");
    if (!responseTime) return toast.error("Please select a response time");
    if (description && description.length < 10) {
      return toast.error("Description must be at least 10 characters");
    }

    try {
      if (editingPriority) {
        await updatePriority({
          id: editingPriority.priority_id,
          data: {
            name,
            description,
            color_value: color,
            response_time_id: responseTime,
            is_active: escalate,
          },
        }).unwrap();
        toast.success("Priority updated successfully");
      } else {
        await createPriority({
          name,
          description,
          color_value: color,
          response_time_id: responseTime,
          is_active: escalate,
        }).unwrap();
        toast.success("Priority created successfully");
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            {editingPriority
              ? "Edit Request Priority"
              : "Create New Request Priority"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex w-full flex-col"
        >
          <div className="flex w-full gap-10">
            <div className="flex w-1/2 flex-col gap-3 space-y-1">
              <Label htmlFor="priority-name">Priority Name</Label>
              <Input
                id="priority-name"
                type="text"
                value={name}
                onChange={(e) => {
                  // Allow only letters and spaces
                  const value = e.target.value;
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    setName(value);
                  }
                }}
                placeholder="Enter priority name"
                required
              />

              <Label htmlFor="response-time">Response Time</Label>
              <Select
                value={responseTime}
                onValueChange={setResponseTime}
                disabled={isResponseTimesLoading}
              >
                <SelectTrigger className="h-11 w-[300px]">
                  <SelectValue
                    placeholder={
                      isResponseTimesLoading
                        ? "Loading..."
                        : "Select response time"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {responseTimesData?.data?.map((item: any) => (
                    <SelectItem
                      key={item.response_time_id}
                      value={item.response_time_id}
                    >
                      {`${item.duration} ${item.unit}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="priority-description">Description</Label>
              <Textarea
                id="priority-description"
                value={description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) setDescription(value); // max 200
                }}
                placeholder="Enter description (optional, 10-200 characters)"
              />

              {/* Character counter */}
              <p
                className={`text-sm mt-1 ${
                  description.length < 10 ? "text-red-600" : "text-gray-500"
                }`}
              >
                {description.length < 10
                  ? `Minimum 10 characters required (${
                      10 - description.length
                    } more to reach min)`
                  : description.length < 200
                  ? `${description.length} / 200 characters (You can type ${
                      200 - description.length
                    } more)`
                  : `Maximum 200 characters reached`}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={escalate}
                  onChange={() => setEscalate(!escalate)}
                  id="escalate-checkbox"
                />
                <Label htmlFor="escalate-checkbox">
                  Escalate to Central Team when triggered
                </Label>
              </div>
            </div>

            <div className="flex w-1/2 flex-col gap-3 space-y-1">
              <Label htmlFor="priority-color">Priority Color</Label>
              <div className="min-h-[200px] border bg-white shadow-md p-3 rounded-md">
                <HexColorPicker color={color} onChange={setColor} />
              </div>
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {editingPriority
                ? isUpdating
                  ? "Updating..."
                  : "Update"
                : isCreating
                ? "Creating..."
                : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
