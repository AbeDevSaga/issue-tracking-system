import { useParams, Link } from "react-router-dom";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import {
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
} from "../../redux/services/projectApi";
import DetailHeader from "../../components/common/DetailHeader";
import {
  ArrowRight,
  Edit,
  Trash2,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../components/common/DeleteModal";
import ProjectUserList from "../../components/tables/lists/projectUserList";
import { ActionButton } from "../../types/layout";
import HierarchyNodeList from "../../components/tables/lists/hierarchyNodeList";
import IssueFlowList from "../../components/tables/lists/issueFlowList";
import ProjectAssignedUsers from "../../components/tables/lists/projectAssignedUsers";
import { Button } from "../../components/ui/cn/button";
import { Input } from "../../components/ui/cn/input";
import { Label } from "../../components/ui/cn/label";
import { Textarea } from "../../components/ui/cn/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/cn/select";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useGetProjectByIdQuery(id!);
  const [deleteProject, { isLoading: deletingProjectLoading }] =
    useDeleteProjectMutation();
  const [updateProject, { isLoading: updatingProject }] =
    useUpdateProjectMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"issueFlow" | "users">(
    "issueFlow"
  );

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // Save project ID to localStorage on every load/update
  useEffect(() => {
    if (id) {
      localStorage.setItem("current_project_id", id);
    }
  }, [id]);

  // Initialize edit form when project data loads
  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name || "",
        description: project.description || "",
        is_active: project.is_active ?? true,
      });
    }
  }, [project]);

  const actions: ActionButton[] = [
    {
      label: "Issue Flow",
      icon: <FolderIcon className="h-4 w-4" />,
      variant: activeTab === "issueFlow" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("issueFlow"),
    },
    {
      label: "Assigned Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "users" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("users"),
    },
  ];

  const handleDelete = async () => {
    try {
      await deleteProject(id!).unwrap();
      setIsOpen(false);
      toast.success("Project deleted successfully");
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete project");
    }
  };

  const handleEdit = async () => {
    try {
      await updateProject({ id: id!, ...editForm }).unwrap();
      setIsEditModalOpen(false);
      toast.success("Project updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update project");
    }
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateWithTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  // Search and filter functions
  const filterItems = (items: any[]) => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "ACTIVE") return item.is_active === true;
        if (statusFilter === "INACTIVE") return item.is_active === false;
        return true;
      });
    }

    return filtered;
  };

  // Pagination functions
  const paginateItems = (items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: any[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              Project Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/project"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Projects
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Delete Modal */}
      <DeleteModal
        message="Are you sure you want to delete this project? This action cannot be undone."
        onCancel={() => setIsOpen(false)}
        onDelete={handleDelete}
        open={isOpen}
        isLoading={deletingProjectLoading}
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#094C81]">
                Edit Project
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#094C81] hover:text-gray-600 transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Project Name *
                </Label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter project name"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Description
                </Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Enter project description"
                  className="w-full"
                  rows={3}
                />
              </div>

              <div>
                <Label className="block text-sm text-[#094C81] font-medium mb-2">
                  Status
                </Label>
                <Select
                  value={editForm.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, is_active: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updatingProject}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEdit}
                  disabled={updatingProject || !editForm.name.trim()}
                  className="bg-[#094C81] hover:bg-[#094C81]/80"
                >
                  {updatingProject ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PageMeta
        title={`${project.name} - Project Details`}
        description={`View details for ${project.name}`}
      />

      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Search and Filters */}
          <div className="flex justify-between items-center">
            <DetailHeader
              breadcrumbs={[
                { title: "Organization", link: "" },
                { title: "Project", link: "" },
              ]}
            />
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10 w-64"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-4">
                <button onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer" />
                </button>
                <button onClick={() => setIsOpen(true)}>
                  <Trash2 className="h-5 w-5 text-[#B91C1C] hover:text-[#991B1B] cursor-pointer" />
                </button>
              </div>
            </div>
          </div>

          {/* Project Info Card */}
          <Card className="bg-white rounded-lg shadow-sm border border-[#BFD7EA] overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#094C81]/10 rounded-lg">
                    <FolderIcon className="h-5 w-5 text-[#094C81]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#094C81] text-lg font-semibold m-0">
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="light"
                  color={project.is_active ? "success" : "error"}
                  size="sm"
                  className="text-xs shrink-0"
                >
                  {project.is_active ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {project.institutes?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <BuildingOfficeIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Institutes:
                    </span>
                    <span className="text-gray-600 text-sm">
                      {project.institutes.map((i: any) => i.name).join(", ")}
                    </span>
                  </div>
                )}
                {project && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-[#1E516A]" />
                    <span className="text-xs font-medium text-[#1E516A]">
                      Maintenance Support Date:
                    </span>
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      {project.maintenances?.[0]?.start_date &&
                        formatDateShort(project.maintenances[0].start_date)}
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                      {project.maintenances?.[0]?.end_date &&
                        formatDateShort(project.maintenances[0].end_date)}
                    </span>
                  </div>
                )}
              </div>

              {project.deleted_at && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="flex items-center gap-2 text-xs">
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">Deleted:</span>
                    <span className="text-red-600">
                      {formatDateWithTime(project.deleted_at)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination Controls (if needed for the content below) */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {currentPage} of {getTotalPages(filterItems([]))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= getTotalPages(filterItems([]))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "issueFlow" && (
            <IssueFlowList
              toggleActions={actions}
              parent_hierarchy_node_id={project.hierarchy_node_id}
            />
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
