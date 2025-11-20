import { useParams, Link } from "react-router-dom";
import {
  useGetHierarchyNodeByIdQuery,
  HierarchyNode,
} from "../../redux/services/hierarchyNodeApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  RectangleStackIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  FolderIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/cn/card";
import ProjectUserRolesTable from "../../components/tables/lists/ProjectUserRolesTable";

const OrgStructureDetail = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: orgStructure,
    isLoading,
    isError,
  } = useGetHierarchyNodeByIdQuery(id!);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP p");
    } catch {
      return dateString;
    }
  };

  // orgStructure.project_id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">
            Loading organization structure details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !orgStructure) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              Organization Structure Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The organization structure you're looking for doesn't exist or has
              been removed.
            </p>
            <Link
              to="/org_structure"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Organization Structures
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${orgStructure.name} - Organization Structure Details`}
        description={`View details for ${orgStructure.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/org_structure"
                className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-medium">
                  Back to Organization Structures
                </span>
              </Link>
            </div>
          </div>

          {/* Organization Structure Info Card */}
          <Card className="bg-white rounded-xl shadow-md border border-dashed border-[#BFD7EA]">
            <CardHeader className="flex flex-row items-center border w-full justify-between text-[#094C81] rounded-t-xl">
              <div className="flex items-start gap-3">
                <RectangleStackIcon className="h-6 w-6" />
                <CardTitle className="text-[#094C81] text-xl">
                  {orgStructure.name}
                </CardTitle>
              </div>
              {/* Status Badge */}
              <div className="">
                <Badge
                  variant="light"
                  color={orgStructure.is_active ? "success" : "error"}
                  size="md"
                  className="text-sm"
                >
                  {orgStructure.is_active ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Description */}
              {orgStructure.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#1E516A] mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {orgStructure.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1">
                    Level
                  </p>
                  <p className="text-gray-700 font-medium">
                    {orgStructure.level !== undefined
                      ? `Level ${orgStructure.level}`
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <FolderIcon className="h-3 w-3" />
                    Project
                  </p>
                  <p className="text-gray-700 font-medium">
                    {orgStructure.project?.name || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <ArrowUpIcon className="h-3 w-3" />
                    Parent Node
                  </p>
                  <p className="text-gray-700 font-medium">
                    {orgStructure.parent?.name || "Root Node"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Created At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(orgStructure.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Updated At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(orgStructure.updated_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1">
                    Node ID
                  </p>
                  <p className="text-gray-700 font-medium text-xs break-all">
                    {orgStructure.hierarchy_node_id}
                  </p>
                </div>
              </div>

              {/* Deleted At (if applicable) */}
              {orgStructure.deleted_at && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                    Deleted At
                  </p>
                  <p className="text-red-600 font-medium">
                    {formatDate(orgStructure.deleted_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Users */}
          <ProjectUserRolesTable
            projectId={orgStructure.project_id || ""}
            inistitute_id={orgStructure.project.institutes[0]?.institute_id || ""}
            hierarchy_node_id={id || ""}
            hierarchy_node_name={orgStructure.name || ""}
          />
        </div>
      </div>
    </>
  );
};

export default OrgStructureDetail;
