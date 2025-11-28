"use client";

import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateUserModal } from "../../modals/CreateUserModal";
import { EditUserModal } from "../../modals/EditUserModal";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  User,
} from "../../../redux/services/userApi";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserPositionId } from "../../../utils/helper/userPosition";

// --- Define table columns ---
const UserTableColumns = (handleEdit: (user: User) => void) => [
  {
    id: "serial",
    header: "#",
    cell: ({ row }: any) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">
        {row.getValue("full_name")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: any) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    cell: ({ row }: any) => <div>{row.getValue("phone_number") || "N/A"}</div>,
  },
  {
    accessorKey: "institute.name",
    header: "Institute",
    cell: ({ row }: any) => {
      const inst = row.original.institute?.name || "N/A";
      return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full`}>
          {inst.replace("_", " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "userType.name",
    header: "User Type",
    cell: ({ row }: any) => {
      const userType = row.original.userType?.name || "N/A";
      return (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            userType === "internal_user"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {userType.replace("_", " ")}
        </span>
      );
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }: any) => <div>{row.getValue("phone_number")}</div>,
    },
    logged_user_type !== "external_user" &&
      user_type === "external_user" && {
        accessorKey: "institute.name", // ✅ Access nested userType name
        header: "Institute",
        cell: ({ row }: any) => {
          const inst = row.original.institute?.name || "N/A";
          return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full`}>
              {inst.replace("_", " ")}
            </span>
          );
        },
      },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => {
        const isActive = row.getValue("is_active");
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const user = row.original as User;
        const [deleteUser] = useDeleteUserMutation();

        const handleDelete = async () => {
          try {
            await deleteUser(user.user_id).unwrap();
            toast.success("User deleted successfully!");
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete user");
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
              <Link to={`/users/${user.user_id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/users/${user.user_id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button> */}
            {/* <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
          </div>
        );
      },
    },
  ].filter(Boolean);
  const { user } = useAuth();
  const positionId = getUserPositionId(logged_user_type, user_type, false);

  // user_position_id
  const { data, isLoading, isError } = useGetUsersQuery({
    institute_id: user?.institute?.institute_id || inistitute_id,
    user_position_id: user_position_id || positionId,
    user_type_id: user_type_id,
  });
  // useGetUsersByInstituteIdQuery
  const [response, setResponse] = useState<User[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
  });

  // --- Convert API data to array ---
  useEffect(() => {
    if (!isError && !isLoading && data) {
      const usersArray = Array.isArray(data) ? data : data.data || [];
      setResponse(usersArray);
      setFilteredResponse(usersArray);
      setPageDetail((prev) => ({
        ...prev,
        pageCount: Math.ceil(usersArray.length / prev.pageSize),
      }));
    }
  }, [data, isError, isLoading]);

  // --- Filter by status ---
  useEffect(() => {
    const filtered = response.filter((user) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return user.is_active;
      if (statusFilter === "inactive") return !user.is_active;
      return true;
    });
    setFilteredResponse(filtered);
    setPageDetail((prev) => ({
      ...prev,
      pageCount: Math.ceil(filtered.length / prev.pageSize),
      pageIndex: 0,
    }));
  }, [response, statusFilter]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPageDetail({ ...pageDetail, pageIndex, pageSize });
  };

  const handleUserCreated = () => {
    refetch();
    toast.success("User created successfully!");
  };

  const handleUserUpdated = () => {
    refetch();
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const actions: ActionButton[] = [
    {
      label: buttonLabel,
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setCreateModalOpen(true),
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      value: statusFilter,
      onChange: (val: string | string[]) => {
        setStatusFilter(Array.isArray(val) ? val[0] : val);
      },
    },
  ];

  // Calculate paginated data
  const startIndex = pageDetail.pageIndex * pageDetail.pageSize;
  const endIndex = startIndex + pageDetail.pageSize;
  const paginatedData = filteredResponse.slice(startIndex, endIndex);

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
        title="User Management"
        description="Manage system users and their permissions"
      >
        <DataTable
          columns={UserTableColumns(handleEditUser)}
          data={paginatedData}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
          isLoading={isLoading}
        />
      </PageLayout>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          userId={selectedUser.user_id}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </>
  );
}
