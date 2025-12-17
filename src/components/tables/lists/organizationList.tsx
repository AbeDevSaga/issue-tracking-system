"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { useGetInstitutesQuery } from "../../../redux/services/instituteApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateInstituteModal } from "../../modals/CreateInstituteModal";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";

// --- Table columns ---
const InstituteTableColumns = [
  {
    id: "serial",
    header: "#",
    cell: ({ row }: any) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "name",
    header: "Organization Name",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">{row.getValue("name")}</div>
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const institute = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/organization/${institute.institute_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

export default function OrganizationList() {
  const { search } = useGlobalSearch();

  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
    },
  ];

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

  const { isLoading, isError, data } = useGetInstitutesQuery();

  // Initialize response
  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data || []);
      setFilteredResponse(data || []);
    }
  }, [data, isError, isLoading]);

  // Apply status filter + global search
  useEffect(() => {
    const filtered = response.filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "ACTIVE" && !item.is_active) return false;
        if (statusFilter === "INACTIVE" && item.is_active) return false;
      }

      // Global search
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        (item.is_active ? "active" : "inactive").includes(q)
      );
    });

    setFilteredResponse(filtered);
    setPageDetail((prev) => ({ ...prev, pageIndex: 0 })); // Reset pagination
  }, [response, statusFilter, search]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={InstituteTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      <CreateInstituteModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
