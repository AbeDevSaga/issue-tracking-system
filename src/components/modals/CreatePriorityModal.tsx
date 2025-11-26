"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/cn/button";
import { Input } from "../ui/cn/input";
import { Label } from "../ui/cn/label";
import { useCreateIssuePriorityMutation } from "../../redux/services/issuePriorityApi";
import { XIcon } from "lucide-react";
import { Textarea } from "../ui/cn/textarea";
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from "../ui/cn/select";

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
  const [responseTime, setResponseTime] = useState("");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Create New Priority
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
          className="space-y-4 flex w-full flex-col"
        >
          <div className="flex w-full gap-10">
            <div className="flex w-1/2 flex-col gap-3  space-y-1">
              
              
              <div className="flex flex-col w-full"> 
                <Label
                  htmlFor="priority-name"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Priority Name
                </Label>
                <Input
                  id="priority-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter priority name"
                  required
                  className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>
              {/* Response Time */}
              <div className="flex flex-col w-full">
                <Label
                  htmlFor="response-time"
                  className="block text-sm text-[#094C81] font-medium mb-2"
                >
                  Response Time
                </Label>
              </div>
              <Select

               value={responseTime} onValueChange={(value) => setResponseTime(value)}>
                <SelectTrigger className="w-full bg-white h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none">
                  <SelectValue className="text-sm text-[#094C81] font-medium" placeholder="Select response time" />
                </SelectTrigger>
                <SelectContent className="text-sm bg-white text-[#094C81] font-medium">
                  <SelectItem className="text-sm text-[#094C81] font-medium" value="1hr">1 Hour</SelectItem>
                  <SelectItem className="text-sm text-[#094C81] font-medium" value="4hr">4 Hours</SelectItem>
                  <SelectItem className="text-sm text-[#094C81] font-medium" value="1day">1 Day</SelectItem>
                  <SelectItem className="text-sm text-[#094C81] font-medium" value="2day">2 Days</SelectItem>
                  <SelectItem className="text-sm text-[#094C81] font-medium" value="1week">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-1/2 flex-col space-y-1">
              <Label
                htmlFor="priority-description"
                className="block text-sm text-[#094C81] font-medium mb-2"
              >
                Description
              </Label>
              <Textarea
                id="priority-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
                className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Priority"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
