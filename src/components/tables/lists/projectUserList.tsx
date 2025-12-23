"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../ui/cn/button";

import { useGetUsersAssignedToProjectQuery } from "../../../redux/services/userApi";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { useTablePagination } from "../../../hooks/useTablePagination";

import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";

// ------------------- Table Columns -------------------
const ProjectUserTableColumns = () => [
  {
    header: "#",
    cell: ({ row }: any) => row.index + 1,
  },
  {
    accessorKey: "user.full_name",
    header: "Full Name",
    cell: ({ row }: any) => (
      <span className="font-medium text-blue-600">
        {row.original.user?.full_name || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "user.email",
    header: "Email",
    cell: ({ row }: any) => <span>{row.original.user?.email || "N/A"}</span>,
  },
  {
    accessorKey: "role.name",
    header: "Role",
    cell: ({ row }: any) => (
      <span className="font-medium text-gray-700">
        {row.original.role?.name || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "hierarchyNode.name",
    header: "Assigned Structure",
    cell: ({ row }: any) => (
      <span>{row.original.hierarchyNode?.name || "N/A"}</span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }: any) => {
      const isActive = row.getValue("is_active");
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  // {
  //   header: "Actions",
  //   cell: ({ row }: any) => {
  //     const userAssignment = row.original;

  //     return (
  //       <div className="flex items-center space-x-2">
  //         <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
  //           <Link to={`/users/${userAssignment.user_id}`}>
  //             <Eye className="h-4 w-4" />
  //           </Link>
  //         </Button>
  //       </div>
  //     );
  //   },
  // },
];

interface ProjectUserListProps {
  project_id: string;
  toggleActions?: ActionButton[];
}

// ------------------- Component -------------------
export default function ProjectUserList({
  project_id,
  toggleActions,
}: ProjectUserListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get search from context
  const { search } = useGlobalSearch();

  const { data, isLoading, isError } = useGetUsersAssignedToProjectQuery(
    project_id,
    {
      skip: !project_id,
    }
  );

  // Load data
  useEffect(() => {
    if (!isError && !isLoading && data) {
      // Access the data array from the response
      const userAssignments = data.data || [];
      setUsers(Array.isArray(userAssignments) ? userAssignments : []);
    }
  }, [data, isError, isLoading]);

  // Safe data
  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  // Use the same pagination hook as InstituteList
  const {
    data: paginatedUsers,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeUsers,
    search,
    statusFilter,
    statusAccessor: (user) => (user.is_active ? "ACTIVE" : "INACTIVE"),
    searchFields: [
      (user) => user.user?.full_name || "",
      (user) => user.user?.email || "",
      (user) => user.role?.name || "",
      (user) => user.hierarchyNode?.name || "",
    ],
  });

  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
      value: statusFilter,
      onChange: (value) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
        resetPage(); // Reset to page 1 when filter changes
      },
    },
  ];

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          Loading project users...
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className="text-red-600 p-4">Error loading project users</div>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        title="Assigned Users"
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        showtoggle={false} // Hide toggle since we only have table view
      >
        <DataTable
          columns={ProjectUserTableColumns()}
          data={paginatedUsers}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
    </>
  );
}
