"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileUploadField } from "../../components/common/FileUploadField";
import { useResolveIssueMutation } from "../../redux/services/issueResolutionApi";

interface ResolutionPreviewProps {
  issue_id: string;
  resolved_by: string;
  onClose?: () => void;
}

export default function ResolutionPreview({
  issue_id,
  resolved_by,
  onClose,
}: ResolutionPreviewProps) {
  const [reason, setReason] = useState("");
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);

  const [resolveIssue, { isLoading }] = useResolveIssueMutation();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return toast.error("Please provide a resolution reason.");
    }

    try {
      await resolveIssue({
        issue_id,
        reason,
        resolved_by,
        attachment_ids: attachmentIds,
      }).unwrap();

      toast.success("Issue resolved successfully!");
      onClose?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resolve issue.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-full lg:w-[360px] bg-white border-l border-[#D5E3EC] h-full p-6 flex flex-col gap-4 shadow-lg"
    >
      <div className="flex flex-col gap-3">
        <h4 className="font-semibold text-[#1E516A]">Document Attachment</h4>

        <FileUploadField
          id="resolution_attachments"
          label="Upload files"
          value={attachmentIds}
          onChange={setAttachmentIds}
          accept="image/*,.pdf,.doc,.docx"
          multiple={true}
        />

        <h4 className="font-semibold text-[#1E516A] mt-4">Resolution Reason</h4>
        <textarea
          className="w-full border border-[#BFD7EA] rounded-lg p-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#1E516A]"
          placeholder="Explain how this issue was resolved"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="w-full flex justify-end mt-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-[#1E516A] text-white font-semibold disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Confirm"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
