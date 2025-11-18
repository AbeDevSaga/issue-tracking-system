import { useParams, Link } from 'react-router-dom';
import { useGetUserByIdQuery, User } from '../../redux/services/userApi';
import PageMeta from '../../components/common/PageMeta';
import Badge from '../../components/ui/badge/Badge';
import { format } from 'date-fns';
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
  KeyIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/cn/card';
import { getFileUrl } from '../../utils/fileUrl';

// Type for wrapped API response
interface UserApiResponse {
  success: boolean;
  message: string;
  data: User;
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useGetUserByIdQuery(id!);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP p');
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
            <h2 className="text-xl font-semibold text-[#1E516A] mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-4">The user you're looking for doesn't exist or has been removed.</p>
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

  return (
    <>
      <PageMeta
        title={`${userData.full_name} - User Details`}
        description={`View details for ${userData.full_name}`}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/users"
                className="inline-flex items-center gap-2 text-[#094C81] hover:text-[#073954] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-medium">Back to Users</span>
              </Link>
            </div>
          </div>

          {/* User Profile Card */}
          <Card className="bg-white rounded-xl shadow-md border border-dashed border-[#BFD7EA]">
            <CardHeader className="flex flex-row items-center border w-full justify-between text-[#094C81] rounded-t-xl">
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="w-20 h-20 overflow-hidden border-2 border-[#094C81] rounded-full flex items-center justify-center bg-gradient-to-br from-[#094C81] to-[#073954]">
                  {userData.profile_image ? (
                    <img
                      src={getFileUrl(userData.profile_image)}
                      alt={userData.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-[#094C81] text-2xl mb-1">
                    {userData.full_name}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{userData.email}</p>
                </div>
              </div>
              {/* Status Badge */}
    <div>
                <Badge
                  variant="light"
                  color={userData.is_active ? 'success' : 'error'}
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
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <EnvelopeIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Email Address
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">{userData.email || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PhoneIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Phone Number
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">{userData.phone_number || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BriefcaseIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Position
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">{userData.position || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Institute
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {userData.institute?.name || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircleIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      User Type
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {userData.userType?.name || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Hierarchy Node
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {userData.hierarchyNode?.name || 'N/A'}
                  </p>
                </div>
              </div>

          

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Created At
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {formatDate(userData.created_at)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-[#1E516A]" />
                    <p className="text-xs font-semibold text-[#1E516A] uppercase tracking-wide">
                      Updated At
                    </p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {formatDate(userData.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
    </>
  );
};

export default UserDetail;