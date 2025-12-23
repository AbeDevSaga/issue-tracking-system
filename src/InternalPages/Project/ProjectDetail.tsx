"use client";

import { useParams, Link } from "react-router-dom";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import {
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
} from "../../redux/services/projectApi";
import { useGetProjectMetricsQuery } from "../../redux/services/projectMetricApi";
import DetailHeader from "../../components/common/DetailHeader";
import { ArrowRight, Edit, Trash2, Users, Check, CalendarIcon } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../components/common/DeleteModal";
import ProjectUserList from "../../components/tables/lists/projectUserList";
import { ActionButton } from "../../types/layout";
import HierarchyNodeList from "../../components/tables/lists/hierarchyNodeList";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError, refetch } = useGetProjectByIdQuery(id!);
  const [deleteProject, { isLoading: deletingProjectLoading }] =
    useDeleteProjectMutation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"hierarchy" | "users">("hierarchy");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const { data: metricsData, isLoading: loadingMetrics } = useGetProjectMetricsQuery({});
  const metrics = metricsData || [];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    maintenance_start: "",
    maintenance_end: "",
    project_metrics_ids: [] as string[],
  });

  const [selectAllMetrics, setSelectAllMetrics] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        is_active: project.is_active ?? true,
        maintenance_start: project.maintenances?.[0]?.start_date || "",
        maintenance_end: project.maintenances?.[0]?.end_date || "",
        project_metrics_ids: project.project_metrics?.map((pm: any) => pm.project_metric_id) || [],
      });
    }
  }, [project]);

  // Update selectAll state based on current selection
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectAllMetrics(formData.project_metrics_ids.length === metrics.length);
    }
  }, [formData.project_metrics_ids, metrics]);

  const toggleMetric = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      project_metrics_ids: prev.project_metrics_ids.includes(metricId)
        ? prev.project_metrics_ids.filter(id => id !== metricId)
        : [...prev.project_metrics_ids, metricId]
    }));
  };

  const handleSelectAllMetrics = () => {
    if (selectAllMetrics) {
      // Deselect all
      setFormData(prev => ({ ...prev, project_metrics_ids: [] }));
      setSelectAllMetrics(false);
    } else {
      // Select all
      const allMetricIds = metrics.map((metric: any) => metric.project_metric_id);
      setFormData(prev => ({ ...prev, project_metrics_ids: allMetricIds }));
      setSelectAllMetrics(true);
    }
  };

  const actions: ActionButton[] = [
    {
      label: "Hierarchy",
      icon: <FolderIcon className="h-4 w-4" />,
      variant: activeTab === "hierarchy" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("hierarchy"),
    },
    {
      label: "Assigned Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "users" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("users"),
    },
  ];

  const handleUpdate = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Project name is required");
        return;
      }

      const updateData = {
        name: formData.name,
        description: formData.description || undefined,
        is_active: formData.is_active,
        maintenance_start: formData.maintenance_start || undefined,
        maintenance_end: formData.maintenance_end || undefined,
        project_metrics_ids: formData.project_metrics_ids.length > 0 
          ? formData.project_metrics_ids 
          : undefined,
      };

      await updateProject({
        id: project.project_id,
        data: updateData,
      }).unwrap();

      toast.success("Project updated successfully");
      setIsEditOpen(false);
      refetch(); // Refresh the project data
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update project");
    }
  };

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

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "N/A";

    try {
      const [year, month, day] = dateString.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      return format(localDate, "MMM dd, yyyy");
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
      <DeleteModal
        message="Are you sure you want to delete this project? This action cannot be undone."
        onCancel={() => setIsOpen(false)}
        onDelete={handleDelete}
        open={isOpen}
        isLoading={deletingProjectLoading}
      />
      <PageMeta
        title={`${project.name} - Project Details`}
        description={`View details for ${project.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between">
            <DetailHeader
              breadcrumbs={[
                { title: "Organization", link: "" },
                { title: "Project", link: "" },
              ]}
            />
            <div className="flex justify-center items-end gap-4">
              <span>
                <Edit
                  onClick={() => setIsEditOpen(true)}
                  className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer"
                />
              </span>
              <span>
                <Trash2
                  onClick={() => setIsOpen(true)}
                  className="h-5 w-5 text-[#B91C1C] hover:text-[#991B1B] cursor-pointer text-bold"
                />
              </span>
            </div>
          </div>

          {/* Project Info Card - Compact Design */}
          <Card className="bg-white rounded-lg shadow-sm border border-[#BFD7EA] overflow-hidden">
            <CardContent className="p-4">
              {/* Header Row - Compact */}
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

              {/* Details - Horizontal Compact Layout */}
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

              {/* Deleted At - Compact Alert */}
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

          {/* Project Hierarchy */}
          {activeTab === "hierarchy" && (
            <HierarchyNodeList
              project_id={id || ""}
              inistitute_id={project.institutes?.[0]?.institute_id}
              toggleActions={actions}
            />
          )}

          {activeTab === "users" && (
            <ProjectUserList project_id={id || ""} toggleActions={actions} />
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 pointer-events-auto">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl relative z-[10000] max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#094C81]">
                  Edit Project
                </h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#094C81] mb-2">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#094C81] focus:border-transparent outline-none"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#094C81] mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#094C81] focus:border-transparent outline-none"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Project description"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#094C81] border-gray-300 rounded focus:ring-[#094C81]"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                {/* Maintenance Dates */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#094C81] mb-2">
                      Maintenance Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#094C81] focus:border-transparent outline-none"
                      value={formData.maintenance_start || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maintenance_start: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#094C81] mb-2">
                      Maintenance End Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#094C81] focus:border-transparent outline-none"
                      value={formData.maintenance_end || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maintenance_end: e.target.value,
                        })
                      }
                      min={formData.maintenance_start || ''}
                    />
                  </div>

                  {/* Institutes - Read only */}
                  {project?.institutes?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-[#094C81] mb-2">
                        Institutes
                      </label>
                      <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                        {project.institutes.map((institute: any) => (
                          <span
                            key={institute.institute_id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1"
                          >
                            {institute.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Metrics/Human Resources */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-[#094C81]">
                    Project Human Resources
                  </h4>
                  {metrics.length > 0 && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#094C81]/10 cursor-pointer transition-all duration-200 border border-gray-200 bg-white"
                      onClick={handleSelectAllMetrics}
                    >
                      <div
                        className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                          selectAllMetrics
                            ? "bg-[#094C81] border-[#094C81] text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {selectAllMetrics ? <Check className="w-3 h-3 stroke-3" /> : null}
                      </div>
                      <span className="font-medium text-sm text-[#094C81]">
                        Select All
                      </span>
                    </div>
                  )}
                </div>

                {loadingMetrics ? (
                  <div className="text-center py-4">Loading human resources...</div>
                ) : metrics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-md border border-gray-200">
                    No human resources available
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-2">
                    {metrics.map((metric: any) => (
                      <div
                        key={metric.project_metric_id}
                        className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-all duration-200 ${
                          formData.project_metrics_ids.includes(metric.project_metric_id)
                            ? "bg-[#094C81]/10 border-[#094C81]"
                            : "bg-white border-gray-200 hover:border-[#094C81]/50"
                        }`}
                        onClick={() => toggleMetric(metric.project_metric_id)}
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                            formData.project_metrics_ids.includes(metric.project_metric_id)
                              ? "bg-[#094C81] border-[#094C81] text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {formData.project_metrics_ids.includes(metric.project_metric_id) ? (
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          ) : null}
                        </div>
                        <span className="text-sm">{metric.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  Selected: {formData.project_metrics_ids.length} of {metrics.length}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[#094C81] text-white rounded-md hover:bg-[#073954] transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}