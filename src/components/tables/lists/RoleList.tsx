"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Eye, Trash2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from "../../../redux/services/roleApi";

import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { useTablePagination } from "../../../hooks/useTablePagination";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import Breadcrumbs from "../../common/Breadcrumbs";

/* ===================== TABLE COLUMNS ===================== */

const RoleTableColumns = (handleDelete: (id: string) => void) => [
  {
    header: "#",
    cell: ({ row }: any) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Role Name",
    cell: ({ row }: any) => (
      <span className="font-medium text-blue-600">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: any) => row.getValue("description") || "N/A",
  },
  {
    header: "Status",
    cell: ({ row }: any) => {
      const isActive = row.original.is_active;
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
  {
    header: "Actions",
    cell: ({ row }: any) => {
      const role = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/role/${role.role_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(role.role_id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

/* ===================== COMPONENT ===================== */

export default function RoleList() {
  const navigate = useNavigate();
  const { search } = useGlobalSearch();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roles, setRoles] = useState<any[]>([]);

  /* ---------- FETCH DATA ---------- */
  const { data, isLoading, isError } = useGetRolesQuery(undefined);
  const [deleteRole] = useDeleteRoleMutation();

  useEffect(() => {
    if (!isLoading && !isError && data) {
      setRoles(Array.isArray(data) ? data : data?.data || []);
    }
  }, [data, isLoading, isError]);

  /* ---------- SAFE DATA ---------- */
  const safeRoles = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);

  /* ---------- PAGINATION + SEARCH + FILTER ---------- */
  const {
    data: paginatedRoles,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeRoles,
    search,
    statusFilter,
    statusAccessor: (r) => (r.is_active ? "ACTIVE" : "INACTIVE"),
    searchFields: [(r) => r.name, (r) => r.description],
  });

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id).unwrap();
      toast.success("Role deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete role");
    }
  };

  /* ---------- ACTIONS ---------- */
  const actions: ActionButton[] = [
    {
      label: "Create Role",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => navigate("/role/create"),
    },
  ];

  /* ---------- FILTERS ---------- */
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
        resetPage(); // 🔑 consistent behavior
      },
    },
  ];

  /* ---------- STATES ---------- */
  if (isLoading) {
    return <PageLayout title="Role Management">Loading roles...</PageLayout>;
  }

  if (isError) {
    return (
      <PageLayout title="Role Management">Error loading roles.</PageLayout>
    );
  }

  /* ---------- UI ---------- */
  return (
    <>
      <div className="mb-4 space-y-2">
        <Breadcrumbs />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <PageLayout
        title="Role Management"
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={RoleTableColumns(handleDelete)}
          data={paginatedRoles}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
    </>
  );
}
