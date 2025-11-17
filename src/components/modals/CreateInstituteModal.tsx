"use client";

import React, { useState } from "react";
import { useCreateInstituteMutation } from "../../redux/services/instituteApi";
import { Button } from "../ui/cn/button";
import { XIcon } from "lucide-react";

interface CreateInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInstituteModal: React.FC<CreateInstituteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [createInstitute, { isLoading }] = useCreateInstituteMutation();

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Name is required");

    try {
      await createInstitute({
        name,
        description,
        is_active: isActive,
      }).unwrap();
      onClose();
      setName("");
      setDescription("");
      setIsActive(true);
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
          <h2 className="text-[20px] font-bold text-[#094C81]">Add New Organization</h2>
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
              placeholder="Enter institute name"
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
        {/* Active Toggle */}
        {/* <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="opacity-0 w-0 h-0 peer"
              id="active-toggle"
            />
            <label
              htmlFor="active-toggle"
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition-colors duration-200 rounded-full peer-checked:bg-blue-500 ${
                isActive ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                  isActive ? "transform translate-x-6" : ""
                }`}
              />
            </label>
          </div>
          <label
            htmlFor="active-toggle"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Active Institute
          </label>
        </div> */}
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
              "Create Organization"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
