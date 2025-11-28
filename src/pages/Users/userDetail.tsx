import { useParams, Link } from "react-router-dom";
import { useGetUserByIdQuery, User } from "../../redux/services/userApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "../../components/ui/cn/card";
import { getFileUrl } from "../../utils/fileUrl";
import DetailHeader from "../../components/common/DetailHeader";
import { Edit, Trash2, User2Icon } from "lucide-react";
import DeleteModal from "../../components/common/DeleteModal";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDeleteUserMutation } from "../../redux/services/userApi";

// Type for wrapped API response
interface UserApiResponse {
  success: boolean;
  message: string;
  data: User;
}

interface Role {
  role_id: string;
  name: string;
  description?: string;
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useGetUserByIdQuery(id!);
  const [deleteUser, { isLoading: deletingUserLoading }] =
    useDeleteUserMutation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteUser(id!).unwrap();
      setIsOpen(false);
      toast.success("User deleted successfully");
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const formatDate = (dateString?: string | null) => {
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
          <p className="text-[#1E516A] text-lg">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/users"
              className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Users
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle wrapped response if API returns { success, message, data }
  const userData = (user as unknown as UserApiResponse).data || (user as User);

  // Extract roles from user data
  const userRoles: Role[] =
    userData.roles || userData.user_roles?.map((ur: any) => ur.role) || [];

  const userTypeName = userData.userType?.name || "N/A";
  const isInternalUser = userTypeName === "internal_user";

  return (
    <>
      <DeleteModal
        message="Are you sure you want to delete this user? This action cannot be undone."
        onCancel={() => setIsOpen(false)}
        onDelete={handleDelete}
        open={isOpen}
        isLoading={deletingUserLoading}
      />
      <PageMeta
        title={`${userData.full_name} - User Details`}
        description={`View details for ${userData.full_name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex justify-between">
            <DetailHeader
              breadcrumbs={[
                { title: "Users", link: "/users" },
                { title: userData.full_name, link: "" },
              ]}
            />
            <div className="flex justify-center items-end gap-4">
              <Link to={`/users/${userData.user_id}/edit`}>
                <Edit className="h-5 w-5 text-[#094C81] hover:text-[#073954] cursor-pointer text-bold" />
              </Link>
              <span>
                <Trash2
                  onClick={() => setIsOpen(true)}
                  className="h-5 w-5 text-[#B91C1C] hover:text-[#991B1B] cursor-pointer text-bold"
                />
              </span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-white py-5 px-3 rounded-xl border">
            {/* Header */}
            <div className="flex flex-row items-center border-b w-full justify-between text-[#094C81] rounded-t-xl px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="w-20 h-20 overflow-hidden border-2 border-[#094C81] rounded-full flex items-center justify-center bg-white">
                  {userData.profile_image ? (
                    <img
                      src={getFileUrl(userData.profile_image)}
                      alt={userData.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User2Icon className="h-12 w-12 text-[#094C81]" />
                  )}
                </div>

                <div>
                  <h2 className="text-[#094C81] text-2xl mb-1">
                    {userData.full_name}
                  </h2>
                  <p className="text-gray-600 text-sm">{userData.email}</p>
                  {userData.position && (
                    <p className="text-gray-500 text-sm mt-1">
                      {userData.position}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant="light"
                  color={userData.is_active ? "success" : "error"}
                  size="md"
                  className="text-sm"
                >
                  {userData.is_active ? (
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

                {/* User Type Badge */}
                <Badge
                  variant="light"
                  color={isInternalUser ? "primary" : "warning"}
                  size="sm"
                  className="text-xs"
                >
                  <UserGroupIcon className="h-3 w-3 mr-1" />
                  {userTypeName.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <EnvelopeIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Email Address
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {userData.email || "N/A"}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PhoneIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Phone Number
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {userData.phone_number || "N/A"}
                  </p>
                </div>

                {/* User Type */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserGroupIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      User Type
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium capitalize">
                    {userTypeName.replace("_", " ")}
                  </p>
                </div>

                {/* Institute */}
                {/* <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Institute
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {userData.institute?.name ||
                      (isInternalUser ? "EAII" : "N/A")}
                  </p>
                </div> */}

                {/* Hierarchy Node */}
                {userData.hierarchyNode && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="h-4 w-4 text-[#1E516A]" />
                      <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                        Hierarchy Node
                      </p>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {userData.hierarchyNode.name}
                    </p>
                  </div>
                )}
                {/* Roles Section */}
                {userRoles.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheckIcon className="h-5 w-5 text-[#1E516A]" />
                      <h3 className="text-lg font-semibold text-[#1E516A]">
                        User Roles
                      </h3>
                      <Badge variant="light" color="primary" size="sm">
                        {userRoles.length} role(s)
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                      {userRoles.map((role) => (
                        <div
                          key={role.role_id}
                          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-blue-800 text-sm">
                              {role.name}
                            </h4>
                            {/* <Badge variant="light" color="primary" size="xs">
                              Role
                            </Badge> */}
                          </div>
                          {/* {role.description && (
                            <p className="text-blue-600 text-xs">
                              {role.description}
                            </p>
                          )} */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Roles Message */}
                {userRoles.length === 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-600">
                        User Roles
                      </h3>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <ShieldCheckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No roles assigned
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        This user doesn't have any roles assigned yet.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetail;
