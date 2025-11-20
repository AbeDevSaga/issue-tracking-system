import { useEffect, useMemo, useState } from "react";
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
  Eye,
  Lock,
} from "lucide-react";
import {
  useAcceptIssueMutation,
  useGetIssueByIdQuery,
} from "../../redux/services/issueApi";
import FileViewer from "../../components/common/FileView";
import { getFileType, getFileUrl } from "../../utils/fileUrl";
import EscalationPreview from "./EscalationPreview";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { getHeirarchyStructure } from "../../utils/hierarchUtils";
import ResolutionPreview from "./ResolutionPreview";
import IssueHistoryLog from "./IssueHistoryLog";
import {
  canConfirm,
  canEscalate,
  canMarkInProgress,
  canResolve,
} from "../../utils/taskHelper";
import TimelineOpener from "../../components/common/TimelineOpener";

export default function UserTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: issue, isLoading, isError } = useGetIssueByIdQuery(id!);
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [acceptIssue, { isLoading: isAccepting }] = useAcceptIssueMutation();
  const [escalateIssue, setEscalateIssue] = useState(false);
  const [resolveIssue, setResolveIssue] = useState(false);
  const [markIssue, setMarkIssue] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);

  const [fileViewerUrl, setFileViewerUrl] = useState<string | null>(null);
  const [hierarchyStructure, setHierarchyStructure] = useState<any>(null);

  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id || "";

  useEffect(() => {
    if (loggedUser?.user?.project_roles && issue?.project?.project_id) {
      const hierarchy = getHeirarchyStructure(issue.project.project_id, {
        project_roles: loggedUser.user.project_roles,
      });
      setHierarchyStructure(hierarchy);
    }
  }, [loggedUser?.user?.project_roles, issue?.project?.project_id]);

  useEffect(() => {
    setEscalateIssue(canEscalate(userId, issue?.status, issue));
  }, [userId, issue?.status, issue]);

  useEffect(() => {
    setResolveIssue(canResolve(userId, issue?.status, issue?.history));
  }, [userId, issue?.status, issue?.history]);

  useEffect(() => {
    setMarkIssue(canMarkInProgress(userId, issue?.status, issue));
  }, [userId, issue?.status, issue]);

  // Map issue attachments to files array with proper URLs and file info
  const issueFiles =
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

  // File card component for consistent styling
  const FileCard = ({ file }: { file: any }) => (
    <div
      className="border border-[#BFD7EA] rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer group bg-white hover:bg-blue-50"
      onClick={() => openFileViewer(file.url)}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-800 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {file.type} • {new Date(file.uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <Eye className="w-4 h-4 text-blue-600 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  const prevImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex(
        (modalImageIndex - 1 + issueFiles.length) % issueFiles.length
      );
    }
  };

  const nextImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex + 1) % issueFiles.length);
    }
  };

  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  const openFileViewer = (fileUrl: string) => setFileViewerUrl(fileUrl);
  const closeFileViewer = () => setFileViewerUrl(null);
  const closeModal = () => setModalImageIndex(null);

  const handleMarkAsInProgress = async () => {
    if (!id) return;
    try {
      const res = await acceptIssue({ issue_id: id }).unwrap();
      setAlert({
        type: "success",
        message: res.message || "Status updated to In Progress!",
      });
      setSelectedAction("mark_as_inprogress");
      setTimeout(() => setAlert(null), 2000);
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error?.data?.message || "Error updating status.",
      });
      console.error(error);
      setTimeout(() => setAlert(null), 3000);
    }
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

  // Action buttons configuration with permissions
  const actionButtons = [
    {
      key: "mark_as_inprogress",
      label: "Mark as Inprogress",
      desc: markIssue
        ? 'Start working on this issue It will update the status to "In progress"'
        : "Cannot mark in progress - issue is already in progress or you have escalated it",
      color: "#c2b56cff",
      bg: "#E7F3FF",
      border: "#BFD7EA",
      enabled: markIssue,
      onClick: () => {
        if (markIssue) {
          handleMarkAsInProgress();
          setSelectedAction("mark_as_inprogress");
        }
      },
    },
    {
      key: "resolve",
      label: "Resolve Issue",
      desc: resolveIssue
        ? "You have fixed the issue. Provide resolution detail to close the issue."
        : "Cannot resolve - only the user who last accepted this issue can resolve it",
      color: "#1E516A",
      bg: "#E7F3FF",
      border: "#BFD7EA",
      enabled: resolveIssue,
      onClick: () => resolveIssue && setSelectedAction("resolve"),
    },
    {
      key: "escalate",
      label: "Escalate Issue",
      desc: escalateIssue
        ? "This issue requires advanced debugging or specialized expertise from EAII."
        : "Cannot escalate - issue is not in progress or you have already escalated it",
      color: "#6D28D9",
      bg: "#F5F3FF",
      border: "#D9D3FA",
      enabled: escalateIssue,
      onClick: () => escalateIssue && setSelectedAction("escalate"),
    },
  ];

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
          className={`w-full  mx-auto bg-white shadow-md rounded-xl border border-dashed border-[#BFD7EA] p-6 relative overflow-hidden`}
        >
          <div
            className={`w-full transition-all duration-500 ease-in-out  ${
              selectedAction || openTimeline ? "lg:pr-[360px]" : ""
            } `}
          >
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h2 className="text-[#1E516A] text-xl font-bold mb-1">
                    Issue Detail
                  </h2>
                  <p className="text-gray-600">
                    Review issue details and take appropriate action
                  </p>
                </div>
                {!openTimeline && (
                  <TimelineOpener onOpen={() => setOpenTimeline(true)} />
                )}

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
                {/* Issue Attachments */}
                {issueFiles.length > 0 && (
                  <div className="bg-white border border-[#BFD7EA] rounded-lg p-3 flex-1 my-6">
                    <h4 className="font-semibold text-[#1E516A] mb-3">
                      Issue Attachments ({issueFiles.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {issueFiles.map((file, idx) => (
                        <FileCard key={idx} file={file} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Issue Escalations */}
              {issue?.escalations && issue.escalations.length > 0 && (
                <div className="space-y-6 mb-6">
                  {issue.escalations.map((escalation, escalationIndex) => {
                    const escalationFiles =
                      escalation.attachments?.map((attachment) => ({
                        url: getFileUrl(attachment.attachment.file_path),
                        name: attachment.attachment.file_name,
                        path: attachment.attachment.file_path,
                        type: getFileType(attachment.attachment.file_name),
                        uploadedAt: attachment.attachment.created_at,
                        escalationId: escalation.escalation_id,
                        escalatedBy: escalation.escalator?.full_name,
                        escalatedAt: escalation.escalated_at,
                        reason: escalation.reason,
                        fromTier: escalation.fromTierNode.name,
                        toTier: escalation.toTierNode?.name || "EAII",
                      })) || [];

                    return (
                      <div
                        key={escalation.escalation_id}
                        className="border border-[#BFD7EA] rounded-lg p-4"
                        style={{ backgroundColor: "rgba(9, 76, 129, 0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-6 bg-[#6D28D9] rounded-full"></div>
                          <h3 className="text-[#1E516A] font-semibold text-lg">
                            Escalation {escalationIndex + 1}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Escalated From
                            </p>
                            <p className="text-gray-700">
                              {escalation.fromTierNode.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Escalated To
                            </p>
                            <p className="text-gray-700">
                              {escalation.toTierNode?.name || "EAII"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Escalated By
                            </p>
                            <p className="text-gray-700">
                              {escalation.escalator?.full_name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Escalated On
                            </p>
                            <p className="text-gray-700">
                              {formatDate(escalation.escalated_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                            <p className="font-semibold text-[#1E516A] text-sm mb-1">
                              Escalation Reason
                            </p>
                            {escalation.reason || "No reason provided"}
                          </div>

                          <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                            <p className="font-semibold text-[#1E516A] text-sm mb-1">
                              Escalator Level
                            </p>
                            {escalation.escalator?.position || "N/A"}
                          </div>
                        </div>

                        {/* Escalation Attachments */}
                        {escalationFiles.length > 0 && (
                          <div className="mt-4 bg-white border border-[#BFD7EA] rounded-lg p-3">
                            <h4 className="font-semibold text-[#1E516A] mb-3">
                              Escalation Attachments ({escalationFiles.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {escalationFiles.map((file, idx) => (
                                <FileCard
                                  key={`${escalation.escalation_id}-${idx}`}
                                  file={file}
                                  showMeta={true}
                                  metaData={{
                                    escalatedBy: file.escalatedBy,
                                    escalatedAt: file.escalatedAt,
                                    reason: file.reason,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Issue Resolutions */}
              {issue?.resolutions && issue.resolutions.length > 0 && (
                <div className="space-y-6 mb-6">
                  {issue.resolutions.map((resolution, resolutionIndex) => {
                    const resolutionFiles =
                      resolution.attachments?.map((attachment) => ({
                        url: getFileUrl(attachment.attachment.file_path),
                        name: attachment.attachment.file_name,
                        path: attachment.attachment.file_path,
                        type: getFileType(attachment.attachment.file_name),
                        uploadedAt: attachment.attachment.created_at,
                        resolutionId: resolution.resolution_id,
                        resolvedBy: resolution.resolver?.full_name,
                        resolvedAt: resolution.resolved_at,
                        reason: resolution.reason,
                      })) || [];

                    return (
                      <div
                        key={resolution.resolution_id}
                        className="border border-[#BFD7EA] rounded-lg p-4"
                        style={{ backgroundColor: "rgba(9, 76, 129, 0.05)" }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                          <h3 className="text-[#1E516A] font-semibold text-lg">
                            Resolution {resolutionIndex + 1}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Resolved By
                            </p>
                            <p className="text-gray-700">
                              {resolution.resolver?.full_name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Resolver Position
                            </p>
                            <p className="text-gray-700">
                              {resolution.resolver?.position || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Resolved On
                            </p>
                            <p className="text-gray-700">
                              {formatDate(resolution.resolved_at)}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1E516A] text-sm">
                              Resolution Status
                            </p>
                            <p className="text-gray-700">
                              {issue.status || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                            <p className="font-semibold text-[#1E516A] text-sm mb-1">
                              Resolution Reason
                            </p>
                            {resolution.reason || "No reason provided"}
                          </div>

                          <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                            <p className="font-semibold text-[#1E516A] text-sm mb-1">
                              Resolver Contact
                            </p>
                            <div className="text-sm">
                              <p className="text-gray-600">
                                {resolution.resolver?.email || "N/A"}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {resolution.resolver?.phone_number ||
                                  "No phone number"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Resolution Attachments */}
                        {resolutionFiles.length > 0 && (
                          <div className="mt-4 bg-white border border-[#BFD7EA] rounded-lg p-3">
                            <h4 className="font-semibold text-[#1E516A] mb-3">
                              Resolution Attachments ({resolutionFiles.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {resolutionFiles.map((file, idx) => (
                                <FileCard
                                  key={`${resolution.resolution_id}-${idx}`}
                                  file={file}
                                  showMeta={true}
                                  metaData={{
                                    resolvedBy: file.resolvedBy,
                                    resolvedAt: file.resolvedAt,
                                    reason: file.reason,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {issue?.status !== "resolved" && (
                <>
                  <h3 className="text-[#1E516A] font-semibold text-lg mt-4 mb-3 flex items-center gap-2">
                    🎯 Select Action
                  </h3>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {actionButtons.map((action) => (
                      <button
                        key={action.key}
                        onClick={action.onClick}
                        disabled={!action.enabled}
                        className={`flex-1 text-left border rounded-lg p-4 transition-all relative ${
                          selectedAction === action.key
                            ? `border-[${action.border}] bg-[${action.bg}]`
                            : action.enabled
                            ? "border-[#D5E3EC] bg-white hover:bg-gray-50 cursor-pointer"
                            : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {!action.enabled && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAction === action.key
                                ? `border-[${action.color}]`
                                : action.enabled
                                ? "border-gray-300"
                                : "border-gray-200"
                            }`}
                          >
                            {selectedAction === action.key && (
                              <CheckCircle2
                                className="w-4 h-4"
                                style={{ color: action.color }}
                              />
                            )}
                          </div>
                          <p
                            className={`font-semibold ${
                              action.enabled
                                ? "text-[#1E516A]"
                                : "text-gray-500"
                            }`}
                          >
                            {action.label}
                          </p>
                        </div>
                        <p
                          className={`text-sm ${
                            action.enabled ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {action.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              )}
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
          {modalImageIndex !== null && issueFiles.length > 0 && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
              onClick={closeModal}
            >
              <div
                className="relative max-w-[90%] max-h-[90%] bg-white rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={issueFiles[modalImageIndex].url}
                  alt={`Attachment ${modalImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                <button
                  className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </button>
                {issueFiles.length > 1 && (
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
                  {modalImageIndex + 1} / {issueFiles.length}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {selectedAction === "resolve" && (
              <ResolutionPreview
                issue_id={id || ""}
                resolved_by={userId}
                onClose={() => setSelectedAction("")}
              />
            )}
            {selectedAction === "escalate" && (
              <EscalationPreview
                issue_id={id || ""}
                from_tier={hierarchyStructure?.hierarchy_node_id || ""}
                to_tier={hierarchyStructure?.parent_id || ""}
                onClose={() => setSelectedAction("")}
                escalated_by={userId}
              />
            )}{" "}
            {openTimeline && (
              <IssueHistoryLog
                logs={issue?.history || []}
                onClose={() => setOpenTimeline(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
