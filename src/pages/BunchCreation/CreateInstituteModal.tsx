"use client";

import React, { useState } from "react";
import { useCreateInstituteMutation } from "../../redux/services/instituteApi";
import { XIcon } from "lucide-react";
import { Button } from "../../components/ui/cn/button";
import { toast } from "sonner";
interface CreateInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export const BunchCreateInstituteModal: React.FC<CreateInstituteModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [createInstitute, { isLoading }] = useCreateInstituteMutation();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      const res = await createInstitute({
        name,
        description,
        is_active: isActive,
      }).unwrap();

      // Pass ID to ModalPage and DON'T call onClose
      if (onCreated) {
        onCreated(res.institute_id || res.id);
        // Only reset form, don't close the modal
        setName("");
        setDescription("");
        setIsActive(true);
      } else {
        // Only close if no onCreated callback provided
        onClose();
        setName("");
        setDescription("");
        setIsActive(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-2xl w-full max-w-[700px] shadow-2xl transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#094C81]">
            Add New Organization
          </h2>
          <button
            onClick={onClose}
            className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
          >
            <XIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 flex w-full gap-10">
          {/* Name Field */}
          <div className="w-1/2">
            <label className="block text-sm text-[#094C81] font-medium  mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="Enter Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description Field */}
          <div className="w-1/2">
            <label className="block text-sm text-[#094C81] font-medium mb-2">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="Enter institute description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2.5 border-gray-300 text-[#094C81] hover:bg-gray-50 transition-colors duration-200 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className={`px-6 py-2.5 rounded-lg transition-all duration-200 ${
              isLoading || !name.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#094C81] hover:bg-[#094C81]/90"
            } text-white font-medium`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-lg animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
