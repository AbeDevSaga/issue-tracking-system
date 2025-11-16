import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import {
  Upload,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import AssignQAExpert from "../CentralAdminTaskList/QAExpertTaskModal";
import { useGetIssueByIdQuery } from "../../redux/services/issueApi";
import FileViewer from "../../components/common/FileView";
import { getFileType, getFileUrl } from "../../utils/fileUrl";

export default function UserTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: issue, isLoading, isError } = useGetIssueByIdQuery(id!);
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [reworkModal, setReworkModal] = useState(false);
  const [fileViewerUrl, setFileViewerUrl] = useState<string | null>(null);

  // Map attachments to files array with proper URLs and file info
  const files =
    issue?.attachments?.map((attachment) => ({
      url: getFileUrl(attachment.attachment.file_path),
      name: attachment.attachment.file_name,
      path: attachment.attachment.file_path,
      type: getFileType(attachment.attachment.file_name),
      uploadedAt: attachment.attachment.created_at,
    })) || [];

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "document":
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const prevImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex - 1 + files.length) % files.length);
    }
  };

  const nextImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex + 1) % files.length);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  const openModal = (index: number) => setModalImageIndex(index);
  const openFileViewer = (fileUrl: string) => setFileViewerUrl(fileUrl);
  const closeFileViewer = () => setFileViewerUrl(null);
  const openReworkModal = () => setReworkModal(true);
  const closeReworkModal = () => setReworkModal(false);
  const closeModal = () => setModalImageIndex(null);

  const handleMarkAsInProgress = async () => {
    try {
      setAlert({ type: "success", message: "Status updated to In Progress!" });
      setSelectedAction(null);
      setTimeout(() => setAlert(null), 2000);
    } catch (error) {
      setAlert({ type: "error", message: "Error updating status." });
      console.error(error);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const openAssignModal = () => {
    setIsModalOpen(true);
  };
  const closeAssignModal = () => {
    setIsModalOpen(false);
  };
  const handleFormSubmit = (values: Record<string, any>) => {
    setAlert({ type: "success", message: "Developer Assigned successfully!" });
    closeAssignModal();
    setTimeout(() => setAlert(null), 3000);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: "success", message: "Issue Escalated successfully!" });
    setSelectedAction(null);
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };
  const handleSubmitDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: "success", message: "Issue Solved successfully!" });
    setSelectedAction(null);
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !issue) return <div>Error loading issue details</div>;

  return (
    <>
      <PageMeta
        title={t("CATask.ca_task_detail")}
        description={t("CATask.ca_task_detail", {
          title: t("QATasCATaskk.detail"),
        })}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24 flex flex-col items-start">
        <div
          className={`w-full max-w-[1440px] mx-auto bg-white shadow-md rounded-xl border border-dashed border-[#BFD7EA] p-6 relative overflow-hidden`}
        >
          <div
            className={`transition-all duration-500 ease-in-out ${
              selectedAction === "resolve" || selectedAction === "escalate"
                ? "lg:pr-[380px]"
                : ""
            }`}
          >
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h2 className="text-[#1E516A] text-xl font-bold mb-1">
                    Issue Action
                  </h2>
                  <p className="text-gray-600">
                    Review issue details and take appropriate action
                  </p>
                </div>
                <AnimatePresence>
                  {alert && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${
                        alert.type === "success" ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {alert.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="border border-[#BFD7EA] rounded-lg p-4 mb-6"
                style={{ backgroundColor: "rgba(9, 76, 129, 0.05)" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-2">
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      System
                    </p>
                    <p className="text-gray-700">
                      {issue.project?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Category
                    </p>
                    <p className="text-gray-700">
                      {issue.category?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Reported By
                    </p>
                    <p className="text-gray-700">
                      {issue.reporter?.full_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Reported On
                    </p>
                    <p className="text-gray-700">
                      {formatDate(issue.issue_occured_time)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                    <p className="font-semibold text-[#1E516A] text-sm mb-1">
                      Description
                    </p>
                    {issue.description ||
                      issue.title ||
                      "No description provided"}
                  </div>

                  <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                    <p className="font-semibold text-[#1E516A] text-sm mb-1">
                      Action Taken
                    </p>
                    {issue.action_taken || "No action taken yet"}
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className="bg-white border border-[#BFD7EA] rounded-lg p-3 flex-1 mb-6">
                  <h4 className="font-semibold text-[#1E516A] mb-3">
                    Attachments ({files.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="border border-[#BFD7EA] rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => openFileViewer(file.url)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        {file.type === "image" && (
                          <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                          <span className="capitalize">{file.type}</span>
                          <span className="text-blue-600 font-medium group-hover:text-blue-700">
                            View
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-[#1E516A] font-semibold text-lg mt-4 mb-3 flex items-center gap-2">
                🎯 Select Action
              </h3>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {[
                  {
                    key: "mark_as_inprogress",
                    label: "Mark as Inprogress",
                    desc: 'Start working on this issue It will update the status to "In progress"',
                    color: "#c2b56cff",
                    bg: "#E7F3FF",
                    border: "#BFD7EA",
                  },
                  {
                    key: "resolve",
                    label: "Resolve Issue",
                    desc: "You have fixed the issue. Provide resolution detail to close the issue.",
                    color: "#1E516A",
                    bg: "#E7F3FF",
                    border: "#BFD7EA",
                  },
                  {
                    key: "escalate",
                    label: "Escalate Issue",
                    desc: "This issue requires advanced debugging or specialized expertise from EAII.",
                    color: "#6D28D9",
                    bg: "#F5F3FF",
                    border: "#D9D3FA",
                  },
                ].map((action) => (
                  <button
                    key={action.key}
                    onClick={() => {
                      if (action.key === "mark_as_inprogress") {
                        handleMarkAsInProgress();
                        setSelectedAction(action.key);
                      } else {
                        setSelectedAction(action.key);
                      }
                    }}
                    className={`flex-1 text-left border rounded-lg p-4 transition-all ${
                      selectedAction === action.key
                        ? `border-[${action.border}] bg-[${action.bg}]`
                        : "border-[#D5E3EC] bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedAction === action.key
                            ? `border-[${action.color}]`
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAction === action.key && (
                          <CheckCircle2
                            className="w-4 h-4"
                            style={{ color: action.color }}
                          />
                        )}
                      </div>
                      <p className="font-semibold text-[#1E516A]">
                        {action.label}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File Viewer Modal */}
          {fileViewerUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
              <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-semibold text-[#1E516A]">
                    File Preview
                  </h3>
                  <button
                    onClick={closeFileViewer}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 p-4">
                  <FileViewer fileUrl={fileViewerUrl} />
                </div>
              </div>
            </div>
          )}

          {/* Image Gallery Modal */}
          {modalImageIndex !== null && files.length > 0 && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
              onClick={closeModal}
            >
              <div
                className="relative max-w-[90%] max-h-[90%] bg-white rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={files[modalImageIndex].url}
                  alt={`Attachment ${modalImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                <button
                  className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </button>
                {files.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 rounded-full px-3 py-1 text-sm">
                  {modalImageIndex + 1} / {files.length}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {(selectedAction === "resolve" ||
              selectedAction === "escalate") && (
              <motion.div
                key={selectedAction}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-full lg:w-[360px] bg-white border-l border-[#D5E3EC] h-full p-6 flex flex-col gap-4"
              >
                <>
                  <h4 className="font-semibold text-[#1E516A]">
                    Document Attachment
                  </h4>
                  <div className="border border-dashed border-[#BFD7EA] rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-[#F9FBFC] transition">
                    <Upload className="w-8 h-8 mb-2 text-[#1E516A]" />
                    <p className="text-sm">
                      Drag your file(s) or{" "}
                      <span className="text-[#1E516A] underline cursor-pointer">
                        browse
                      </span>
                    </p>
                    <p className="text-xs mt-1">Max xx MB files allowed</p>
                  </div>

                  <h4 className="font-semibold text-[#1E516A] mt-6">
                    {selectedAction === "resolve" ? (
                      <>Resolution Detail</>
                    ) : (
                      <>Escalation Reason</>
                    )}
                  </h4>
                  <textarea
                    className="w-full border border-[#BFD7EA] rounded-lg p-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#1E516A]"
                    placeholder={
                      selectedAction === "resolve"
                        ? "Describe how you solved this issue"
                        : "Explain why this issue needs escalation"
                    }
                  ></textarea>
                  {selectedAction === "resolve" ? (
                    <>
                      <div className="w-full flex justify-end">
                        <button
                          onClick={handleSubmitDocument}
                          className="px-4 py-2 rounded-md bg-[#1E516A] text-white font-semibold"
                        >
                          Confirm
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full flex justify-end">
                        <button
                          onClick={handleSubmit}
                          className="px-4 py-2 rounded-md bg-[#1E516A] text-white font-semibold"
                        >
                          Confirm
                        </button>
                      </div>
                    </>
                  )}
                </>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {isModalOpen && (
        <AssignQAExpert
          onClose={closeAssignModal}
          onSubmit={handleFormSubmit}
          fields={[
            {
              id: "developer",
              label: t("TLTask.developer"),
              type: "select",
              options: [
                { value: "developer1", label: "Developer 1" },
                { value: "developer2", label: "Developer 2" },
              ],
              placeholder: "Select developer",
            },
            {
              id: "priority_level",
              label: "Priority Level",
              type: "select",
              options: [
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ],
            },
            {
              id: "deadline",
              label: "Deadline",
              type: "date",
              placeholder: "Enter ",
            },
            {
              id: "task_summary",
              label: t("TLTask.task_summary"),
              type: "textarea",
              placeholder: "Enter Task Summary",
            },
            {
              id: "document_attachement",
              label: "Document Attachement",
              type: "file",
              placeholder: "Enter Task Summary",
            },
          ]}
        />
      )}
    </>
  );
}
