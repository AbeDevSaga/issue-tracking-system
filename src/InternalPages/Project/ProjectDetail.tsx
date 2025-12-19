import { useParams, Link } from "react-router-dom";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import {
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
} from "../../redux/services/projectApi";
import DetailHeader from "../../components/common/DetailHeader";
import { ArrowRight, Edit, Trash2, Users } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  FolderIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../components/common/DeleteModal";
import { ActionButton } from "../../types/layout";
import IssueFlowList from "../../components/tables/lists/issueFlowList";
import ProjectAssignedUsers from "../../components/tables/lists/projectAssignedUsers";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useGetProjectByIdQuery(id!);

  const [deleteProject, { isLoading: deletingProjectLoading }] =
    useDeleteProjectMutation();

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"issueFlow" | "users">(
    "issueFlow"
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // Save project ID
  useEffect(() => {
    if (id) localStorage.setItem("current_project_id", id);
  }, [id]);

  // Prefill edit form
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        is_active: project.is_active ?? true,
      });
    }
  }, [project]);

  const actions: ActionButton[] = [
    {
      label: "Support Request Flow",
      icon: <FolderIcon className="h-4 w-4" />,
      variant: activeTab === "issueFlow" ? "default" : "outline",
      onClick: () => setActiveTab("issueFlow"),
    },
    {
      label: "Assigned Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "users" ? "default" : "outline",
      onClick: () => setActiveTab("users"),
    },
  ];

  const handleDelete = async () => {
    try {
      await deleteProject(id!).unwrap();
      toast.success("Project deleted successfully");
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete project");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateProject({
        id: project.project_id,
        data: formData,
      }).unwrap();

      toast.success("Project updated successfully");
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update project");
    }
  };

  const formatDateShort = (date?: string) =>
    date ? format(new Date(date), "MMM dd, yyyy") : "N/A";

  const formatDateWithTime = (date?: string) =>
    date ? format(new Date(date), "MMM dd, yyyy 'at' h:mm a") : "N/A";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-[#094C81]" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Link to="/project" className="text-[#094C81]">
              <ArrowLeftIcon className="h-4 w-4 inline" /> Back to Projects
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* DELETE MODAL */}
      <DeleteModal
        open={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onDelete={handleDelete}
        isLoading={deletingProjectLoading}
        message="Are you sure you want to delete this project?"
      />

      {/* EDIT MODAL (NO PORTAL) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#094C81]">
              Edit Project
            </h3>

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
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_active: e.target.checked,
                  })
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

      <PageMeta title={project.name} description={""} />

      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between">
            <DetailHeader
              breadcrumbs={[
                { title: "Organization", link: "" },
                { title: "Project", link: "" },
              ]}
            />
            <div className="flex gap-4">
              <Edit
                onClick={() => setIsEditOpen(true)}
                className="h-5 w-5 text-[#094C81] cursor-pointer"
              />
              <Trash2
                onClick={() => setIsDeleteOpen(true)}
                className="h-5 w-5 text-[#B91C1C] cursor-pointer"
              />
            </div>
          </div>

          <Card className="border">
            <CardContent className="p-4">
              <CardTitle className="text-[#094C81]">{project.name}</CardTitle>
              <p className="text-sm text-gray-600">{project.description}</p>
            </CardContent>
          </Card>

          {activeTab === "issueFlow" && (
            <IssueFlowList toggleActions={actions} />
          )}

          {activeTab === "users" && (
            <ProjectAssignedUsers
              project_id={id || ""}
              toggleActions={actions}
            />
          )}
        </div>
      </div>
    </>
  );
}
