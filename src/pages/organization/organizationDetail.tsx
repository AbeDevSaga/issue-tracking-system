import { useParams, Link } from "react-router-dom";
import { useGetInstituteByIdQuery } from "../../redux/services/instituteApi";
import { Project } from "../../redux/services/projectApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/cn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table/table";
import ProjectList from "../../components/tables/lists/projectList";

const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: organizationDetail,
    isLoading,
    isError,
  } = useGetInstituteByIdQuery(id!);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP p");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">
            Loading organization details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !organizationDetail) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              Organization Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The organization you're looking for doesn't exist or has been
              removed.
            </p>
            <Link
              to="/organization"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Organizations
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${organizationDetail.name} - Organization Details`}
        description={`View details for ${organizationDetail.name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/organization"
                className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-medium">Back to Organizations</span>
              </Link>
            </div>
          </div>

          {/* Organization Info Card */}
          <Card className="bg-white  rounded-xl shadow-md border border-dashed border-[#BFD7EA]">
            <CardHeader className="flex flex-row items-center border w-full justify-between text-[#094C81] rounded-t-xl">
              <div className="flex items-start gap-3">
                <BuildingOfficeIcon className="h-6 w-6" />
                <CardTitle className="text-[#094C81] text-xl">
                  {organizationDetail.name}
                </CardTitle>
              </div>
              {/* Status Badge */}
              <div className="">
                <Badge
                  variant="light"
                  color={organizationDetail.is_active ? "success" : "error"}
                  size="md"
                  className="text-sm"
                >
                  {organizationDetail.is_active ? (
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
              {organizationDetail.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#1E516A] mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {organizationDetail.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1">
                    Has Branch
                  </p>
                  <p className="text-gray-700 font-medium">
                    {organizationDetail.has_branch ? "Yes" : "No"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Created At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(organizationDetail.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Updated At
                  </p>
                  <p className="text-gray-700 font-medium">
                    {formatDate(organizationDetail.updated_at)}
                  </p>
                </div>
              </div>

              {/* Deleted At (if applicable) */}
              {organizationDetail.deleted_at && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                    Deleted At
                  </p>
                  <p className="text-red-600 font-medium">
                    {formatDate(organizationDetail.deleted_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Section */}
          <ProjectList insistitute_id={id || ""} />
        </div>
      </div>
    </>
  );
};

export default OrganizationDetail;
