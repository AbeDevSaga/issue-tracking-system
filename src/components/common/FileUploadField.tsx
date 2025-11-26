"use client";
import React, { useState, useEffect } from "react";
import { Label } from "../../components/ui/cn/label";
import { Button } from "../../components/ui/cn/button";
import { Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useUploadAttachmentsMutation,
  useDeleteAttachmentMutation,
} from "../../redux/services/attachmentApi";

interface FileUploadFieldProps {
  id: string;
  label: string;
  value: string[]; // array of attachment IDs
  onChange: (value: string[]) => void;
  category?: string;
  required?: boolean;
  accept?: string;
  error?: string;
  className?: string;
  labelClass?: string;
  fieldClass?: string;
  multiple?: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  id,
  label,
  value = [],
  onChange,
  category = "documents",
  required = false,
  accept = "image/*,.pdf",
  error,
  className = "",
  labelClass = "",
  fieldClass = "",
  multiple = true,
}) => {
  const [uploadAttachments, { isLoading: isUploading }] =
    useUploadAttachmentsMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  const [files, setFiles] = useState<
    { attachment_id: string; file_name: string; previewUrl?: string | null }[]
  >([]);

  // Initialize with value if provided
  useEffect(() => {
    if (value.length > 0 && files.length === 0) {
      // Map IDs to initial placeholder (you may fetch file names from parent if needed)
      setFiles(value.map((id) => ({ attachment_id: id, file_name: id })));
    }
  }, [value, files.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const uploadPromises = Array.from(selectedFiles).map(async (file) => {
      try {
        const result = await uploadAttachments({ files: [file] }).unwrap();
        if (result.attachments.length > 0) {
          const uploaded = result.attachments[0];
          let previewUrl: string | null = null;
          if (/\.(png|jpe?g|gif)$/i.test(uploaded.file_name)) {
            previewUrl = URL.createObjectURL(file);
          }
          return { ...uploaded, previewUrl };
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    const uploadedFiles = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as { attachment_id: string; file_name: string; previewUrl?: string }[];

    if (uploadedFiles.length > 0) {
      const updatedFiles = [...files, ...uploadedFiles];
      setFiles(updatedFiles);
      onChange(updatedFiles.map((f) => f.attachment_id));
      uploadedFiles.forEach((f) => toast.success(`${f.file_name} uploaded`));
    }
  };

  const handleDelete = async (attachment_id: string) => {
    try {
      await deleteAttachment(attachment_id).unwrap();
      const updatedFiles = files.filter(
        (f) => f.attachment_id !== attachment_id
      );
      setFiles(updatedFiles);
      onChange(updatedFiles.map((f) => f.attachment_id));
      toast.success("File removed successfully");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  // Cleanup previews
  useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, [files]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={id}
        className={`${labelClass ?? "text-sm font-medium"} cursor-pointer`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div
        className={`${fieldClass} relative flex flex-col items-center justify-center border border-[#B1C9E3] rounded-md border-dashed p-3 hover:bg-gray-50 transition cursor-pointer ${
          error ? "border-red-500" : ""
        }`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {isUploading ? (
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-6 h-6 text-gray-500" />
            <p className="text-sm text-gray-600">Click or drag to upload</p>
          </div>
        )}
      </div>

      {/* Grid / List of uploaded files */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-2">
          {files.map((file) => (
            <div
              key={file.attachment_id}
              className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {file.previewUrl && (
                  <img
                    src={file.previewUrl}
                    alt="Preview"
                    className="w-10 h-10 object-cover border rounded"
                  />
                )}
                <span className="text-sm text-gray-700 truncate max-w-[100px]">
                  {file.file_name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(file.attachment_id)}
                className="w-8 h-8 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
