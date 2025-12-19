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
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Card, CardTitle, CardContent } from "../../components/ui/cn/card";
import ProjectList from "../../components/tables/lists/projectList";
import DetailHeader from "../../components/common/DetailHeader";
import { Edit, Trash2 } from "lucide-react";
import DeleteModal from "../../components/common/DeleteModal";
import { toast } from "sonner";

export default function OrganizationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ================= API =================
  const {
    data: organization,
    isLoading,
    isError,
  } = useGetInstituteByIdQuery(id!);

  const [deleteInstitute, { isLoading: deleting }] =
    useDeleteInstituteMutation();

  const [updateInstitute, { isLoading: isUpdating }] =
    useUpdateInstituteMutation();

  // ================= STATE =================
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // ================= EFFECT =================
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        description: organization.description || "",
        is_active: organization.is_active ?? true,
      });
    }
  }, [organization]);

  // ================= HANDLERS =================
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
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update institute");
    }
  };

  const formatDateWithTime = (date?: string) =>
    date ? format(new Date(date), "MMM dd, yyyy 'at' h:mm a") : "N/A";

  // ================= LOADING =================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-[#094C81]" />
      </div>
    );
  }

  // ================= ERROR =================
  if (isError || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Link to="/organization" className="text-[#094C81]">
              <ArrowLeftIcon className="h-4 w-4 inline" /> Back to Organizations
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* ================= DELETE MODAL ================= */}
      <DeleteModal
        open={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onDelete={handleDelete}
        isLoading={deleting}
        message="Are you sure you want to delete this institute?"
      />

      {/* ================= EDIT MODAL (NO PORTAL) ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#094C81]">
              Edit Institute
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

      {/* ================= PAGE ================= */}
      <PageMeta title={organization.name} />

      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between">
            <DetailHeader breadcrumbs={[{ title: "Organization", link: "" }]} />
            <div className="flex gap-4">
              <Edit
                onClick={() => setIsEditOpen(true)}
                className="h-5 w-5 text-[#094C81] cursor-pointer"
              />
              <Trash2
                onClick={() => setIsDeleteOpen(true)}
                className="h-5 w-5 text-red-600 cursor-pointer"
              />
            </div>
          </div>

          <Card className="border">
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-[#094C81]" />
                  <div>
                    <CardTitle>{organization.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {organization.description}
                    </p>
                  </div>
                </div>

                <Badge color={organization.is_active ? "success" : "error"}>
                  {organization.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {organization.deleted_at && (
                <p className="text-sm text-red-600 mt-3">
                  Deleted at {formatDateWithTime(organization.deleted_at)}
                </p>
              )}
            </CardContent>
          </Card>

          <ProjectList insistitute_id={id || ""} userType="internal_user" />
        </div>
      </div>
    </>
  );
}
