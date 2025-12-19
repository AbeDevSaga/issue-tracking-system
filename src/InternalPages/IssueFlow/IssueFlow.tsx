import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useGetInternalNodeByIdQuery,
  useDeleteInternalNodeMutation,
  useUpdateInternalNodeMutation,
} from "../../redux/services/internalNodeApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  RectangleStackIcon,
  XCircleIcon,
  ArrowLeftIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import DetailHeader from "../../components/common/DetailHeader";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/cn/button";
import InternalNodeUsersList from "../../components/tables/lists/InternalNodeUsersList";
import { CreateChildInternalNodeModal } from "../../components/modals/CreateChildInternalNodeModal";
import { toast } from "sonner";

export default function IssueFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const {
    data: issueFlow,
    isLoading,
    isError,
  } = useGetInternalNodeByIdQuery(id!);
  const [updateNode, { isLoading: isUpdating }] =
    useUpdateInternalNodeMutation();
  const [deleteNode, { isLoading: isDeleting }] =
    useDeleteInternalNodeMutation();

  // Prefill edit form
  useEffect(() => {
    if (issueFlow && isEditOpen) {
      setFormData({
        name: issueFlow.name,
        description: issueFlow.description || "",
        is_active: issueFlow.is_active ?? true,
      });
    }
  }, [issueFlow, isEditOpen]);

  const handleUpdate = async () => {
    try {
      await updateNode({
        id: issueFlow!.internal_node_id,
        data: formData,
      }).unwrap();
      toast.success("Node updated successfully");
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update node");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNode(issueFlow!.internal_node_id).unwrap();
      toast.success("Node deleted successfully");
      navigate("/issue_flow");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete node");
    }
  };

  const formatDateWithTime = (date?: string) =>
    date ? format(new Date(date), "MMM dd, yyyy 'at' h:mm a") : "N/A";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-[#094C81]" />
      </div>
    );
  }

  if (isError || !issueFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-[#1E516A]">
              Support Request Flow Not Found
            </h2>
            <Link to="/issue_flow" className="text-[#094C81] font-medium">
              <ArrowLeftIcon className="h-4 w-4 inline mr-1" /> Back to Request
              Flows
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`${issueFlow.name} - Support Request Flow`} />

      {/* ================= CREATE CHILD MODAL ================= */}
      <CreateChildInternalNodeModal
        parentInternalNodeId={id || ""}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* ================= EDIT MODAL ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#094C81]">Edit Node</h3>

            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2 mt-1"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
              <span className="text-sm">Active</span>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-4 py-2 bg-[#094C81] text-white rounded"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE ================= */}
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between">
            <DetailHeader
              breadcrumbs={[{ title: "Support Request Flow", link: "" }]}
            />
            <div className="flex gap-4">
              <Edit
                onClick={() => setIsEditOpen(true)}
                className="h-5 w-5 text-[#094C81] cursor-pointer"
              />
              <Trash2
                onClick={handleDelete}
                className="h-5 w-5 text-red-600 cursor-pointer"
              />
            </div>
          </div>

          <Card className="border">
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div className="flex gap-3 items-center">
                  <RectangleStackIcon className="h-6 w-6 text-[#094C81]" />
                  <div>
                    <CardTitle>{issueFlow.name}</CardTitle>
                    {issueFlow.description && (
                      <p className="text-sm text-gray-500">
                        {issueFlow.description}
                      </p>
                    )}
                  </div>
                </div>

                <Badge color={issueFlow.is_active ? "success" : "error"}>
                  {issueFlow.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {issueFlow.deleted_at && (
                <p className="text-sm text-red-600 mt-3">
                  Deleted at {formatDateWithTime(issueFlow.deleted_at)}
                </p>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Child
          </Button>

          <InternalNodeUsersList
            projectId={localStorage.getItem("current_project_id") || ""}
            internal_node_id={id || ""}
            internal_node_name={issueFlow.name || ""}
          />
        </div>
      </div>
    </>
  );
}
