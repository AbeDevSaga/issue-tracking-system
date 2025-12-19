import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useDeleteInstituteMutation,
  useGetInstituteByIdQuery,
  useUpdateInstituteMutation,
} from "../../redux/services/instituteApi";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { format } from "date-fns";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import ProjectList from "../../components/tables/lists/projectList";
import DetailHeader from "../../components/common/DetailHeader";
import { Edit, Trash2 } from "lucide-react";
import DeleteModal from "../../components/common/DeleteModal";
import { toast } from "sonner";

const OrganizationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  /* ------------------ API HOOKS (TOP ONLY) ------------------ */
  const {
    data: organizationDetail,
    isLoading,
    isError,
    refetch,
  } = useGetInstituteByIdQuery(id!);

  const [deleteInstitute, { isLoading: isDeleteLoading }] =
    useDeleteInstituteMutation();

  const [updateInstitute, { isLoading: isUpdating }] =
    useUpdateInstituteMutation();

  /* ------------------ LOCAL STATE ------------------ */
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  /* ------------------ EFFECT (CORRECT POSITION) ------------------ */
  useEffect(() => {
    if (organizationDetail && isEditOpen) {
      setFormData({
        name: organizationDetail.name,
        description: organizationDetail.description || "",
        is_active: organizationDetail.is_active ?? true,
      });
    }
  }, [organizationDetail, isEditOpen]);

  /* ------------------ HANDLERS ------------------ */
  const handleDelete = async () => {
    try {
      await deleteInstitute(id!).unwrap();
      toast.success("Institute deleted successfully");
      navigate("/organization");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete institute");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateInstitute({
        id: id!,
        data: formData,
      }).unwrap();

      toast.success("Institute updated successfully");
      setIsEditOpen(false);
      refetch(); // ✅ refresh data
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update institute");
    }
  };

  /* ------------------ FORMATTERS ------------------ */
  const formatDateWithTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
  };

  /* ------------------ EARLY RETURNS ------------------ */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError || !organizationDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p>Organization not found</p>
            <Link to="/organization" className="text-blue-600">
              Back
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ------------------ RENDER ------------------ */
  return (
    <>
      <DeleteModal
        open={isDeleteOpen}
        isLoading={isDeleteLoading}
        onCancel={() => setIsDeleteOpen(false)}
        onDelete={handleDelete}
        message="Are you sure you want to delete this institute?"
      />

      {/* ------------------ EDIT MODAL ------------------ */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Edit Institute</h3>

              <input
                className="w-full border px-3 py-2 rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <textarea
                className="w-full border px-3 py-2 rounded"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <label className="flex items-center gap-2">
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
                Active
              </label>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditOpen(false)}>Cancel</button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <PageMeta title={`${organizationDetail.name}`} />

      <div className="p-6">
        <div className="flex justify-between">
          <DetailHeader breadcrumbs={[{ title: "Organization", link: "" }]} />
          <div className="flex gap-4">
            <Edit
              onClick={() => setIsEditOpen(true)}
              className="cursor-pointer"
            />
            <Trash2
              onClick={() => setIsDeleteOpen(true)}
              className="cursor-pointer text-red-600"
            />
          </div>
        </div>

        <Card className="mt-6">
          <CardContent>
            <CardTitle>{organizationDetail.name}</CardTitle>
            <Badge color={organizationDetail.is_active ? "success" : "error"}>
              {organizationDetail.is_active ? "Active" : "Inactive"}
            </Badge>

            {organizationDetail.deleted_at && (
              <p className="text-red-600 mt-2">
                Deleted at {formatDateWithTime(organizationDetail.deleted_at)}
              </p>
            )}
          </CardContent>
        </Card>

        <ProjectList insistitute_id={id || ""} userType="external_user" />
      </div>
    </>
  );
};

export default OrganizationDetail;
