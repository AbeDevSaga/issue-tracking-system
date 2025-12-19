"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateUserModal } from "../../modals/CreateUserModal";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  User,
} from "../../../redux/services/userApi";

import { useAuth } from "../../../contexts/AuthContext";
import { getUserPositionId } from "../../../utils/helper/userPosition";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";

interface UserListProps {
  user_type?: string;
  logged_user_type?: string;
  user_type_id?: string;
  user_position_id?: string;
  inistitute_id?: string;
  toggleActions?: ActionButton[];
}

export default function UserList({
  user_type,
  logged_user_type,
  user_type_id,
  user_position_id,
  inistitute_id,
  toggleActions,
}: UserListProps) {
  const { user } = useAuth();
  const { search } = useGlobalSearch();
  const positionId = getUserPositionId(logged_user_type, user_type, false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
  });

  const { data, isLoading } = useGetUsersQuery({
    institute_id: user?.institute?.institute_id || inistitute_id,
    user_position_id: user_position_id || positionId,
    user_type_id,
    page: pageDetail.pageIndex + 1,
    limit: pageDetail.pageSize,
    search,
    is_active: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const [deleteUser] = useDeleteUserMutation();

  // Sync page count from API
  useEffect(() => {
    if (data?.meta?.pageCount) {
      setPageDetail((prev) => ({
        ...prev,
        pageCount: data.meta.pageCount,
      }));
    }
  }, [data]);

  // Reset page index on global search
  useEffect(() => {
    setPageDetail((p) => ({ ...p, pageIndex: 0 }));
  }, [search, statusFilter]);

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPageDetail({ ...pageDetail, pageIndex, pageSize });
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap();
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  // ================= TABLE COLUMNS =================
  const UserTableColumns = [
    {
      header: "#",
      cell: ({ row }: any) => row.index + 1,
    },
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }: any) => (
        <span className="font-medium text-blue-600">
          {row.getValue("full_name")}
        </span>
      ),
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone_number", header: "Phone Number" },
    logged_user_type !== "external_user" &&
      user_type === "external_user" && {
        header: "Institute",
        cell: ({ row }: any) => row.original.institute?.name || "N/A",
      },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => {
        const active = row.getValue("is_active");
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }: any) => {
        const u = row.original as User;

        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/users/${u.user_id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>

            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingUser(u)}
            >
              <Edit className="h-4 w-4" />
            </Button> */}

            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => handleDelete(u.user_id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ].filter(Boolean);

  // ================= FILTERS =================
  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      value: statusFilter,
      onChange: (val) => {
        setStatusFilter(Array.isArray(val) ? val[0] : val);
      },
    },
  ];

  const actions: ActionButton[] = [
    {
      label:
        user_type === "internal_user"
          ? "Create Internal User"
          : "Create External User",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => setModalOpen(true),
    },
  ];

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
      >
        <DataTable
          columns={UserTableColumns}
          data={data?.data || []}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
          totalRecords={data?.meta?.total || 0}
          loading={isLoading}
        />
      </PageLayout>

      {/* Create / Edit Modal */}
      <CreateUserModal
        logged_user_type={logged_user_type || ""}
        user_type={user_type || "internal_user"}
        user_type_id={user_type_id || ""}
        inistitute_id={inistitute_id || ""}
        existingUser={editingUser || undefined}
        isOpen={isModalOpen || !!editingUser}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
      />
    </>
  );
}
