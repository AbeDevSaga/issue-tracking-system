"use client";

import React, { useEffect, useState } from "react";
import { ToggleRight, ToggleLeft } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { FilterField } from "../../../types/layout";
import {
  useGetPermissionsQuery,
  useTogglePermissionMutation,
} from "../../../redux/services/permissionApi";

// --- Define table columns ---
const PermissionTableColumns = [
  {
    accessorKey: "resource",
    header: "Resource",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">
        {row.getValue("resource")}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }: any) => <div>{row.getValue("action")}</div>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }: any) => {
      const isActive = !!row.getValue("is_active"); // normalize null to false
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
    id: "actions",
    header: "Toggle Status",
    cell: ({ row }: any) => {
      const permission = row.original;
      const [togglePermission] = useTogglePermissionMutation();
      const isActive = !!permission.is_active;

      const handleToggle = async () => {
        await togglePermission(permission.permission_id).unwrap();
      };

      return (
        <Button
          variant="outline"
          size="sm"
          className={`h-8 w-8 p-0 transition-all duration-200 ${
            isActive 
              ? "bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300" 
              : "bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300"
          }`}
          onClick={handleToggle}
        >
          {isActive ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-red-600" />
          )}
        </Button>
      );
    },
  },
];

export default function PermissionList() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
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
      onChange: (value: string | string[]) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
        setPageDetail({ ...pageDetail, pageIndex: 0 });
      },
    },
  ];

  const { data, isLoading, isError } = useGetPermissionsQuery();

  // Map response properly
  useEffect(() => {
    if (!isError && !isLoading && data) {
      const list = data.data.map((p: any) => ({
        ...p,
        is_active: p.is_active ?? false, // normalize null
      }));
      setPermissions(list);
      setFilteredPermissions(list);
    }
  }, [data, isError, isLoading]);

  // Filter by status
  useEffect(() => {
    const filtered = permissions.filter((p) => {
      if (statusFilter === "all") return true;
      const isActive = !!p.is_active;
      return statusFilter === "ACTIVE" ? isActive : !isActive;
    });
    setFilteredPermissions(filtered);
  }, [permissions, statusFilter]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({
      ...pageDetail,
      pageIndex: index,
      pageSize: size,
    });
  };

  return (
    <PageLayout filters={filterFields} filterColumnsPerRow={1}>
      <DataTable
        columns={PermissionTableColumns}
        data={filteredPermissions}
        handlePagination={handlePagination}
        tablePageSize={pageDetail.pageSize}
        totalPageCount={pageDetail.pageCount}
        currentIndex={pageDetail.pageIndex}
      />
    </PageLayout>
  );
}