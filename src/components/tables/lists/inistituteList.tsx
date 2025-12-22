"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Eye, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useGetInstitutesQuery } from "../../../redux/services/instituteApi";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { useTablePagination } from "../../../hooks/useTablePagination";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateInstituteModal } from "../../modals/CreateInstituteModal";
import Breadcrumbs from "../../common/Breadcrumbs";

/* ===================== TABLE COLUMNS ===================== */

const InstituteTableColumns = [
  {
    header: "#",
    cell: ({ row }: any) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Organization Name",
    cell: ({ row }: any) => (
      <span className="font-medium text-blue-600">{row.getValue("name")}</span>
    ),
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
      const institute = row.original;
      return (
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
          <Link to={`/inistitutes/${institute.institute_id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];

/* ===================== COMPONENT ===================== */

export default function InstituteList() {
  const navigate = useNavigate();
  const { search } = useGlobalSearch();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [institutes, setInstitutes] = useState<any[]>([]);

  /* ---------- FETCH DATA ---------- */
  const { data, isLoading, isError } = useGetInstitutesQuery();

  useEffect(() => {
    if (!isLoading && !isError && data) {
      setInstitutes(Array.isArray(data) ? data : []);
    }
  }, [data, isLoading, isError]);

  /* ---------- SAFE DATA ---------- */
  const safeInstitutes = useMemo(
    () => (Array.isArray(institutes) ? institutes : []),
    [institutes]
  );

  /* ---------- PAGINATION + SEARCH + FILTER ---------- */
  const {
    data: paginatedInstitutes,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeInstitutes,
    search,
    statusFilter,
    statusAccessor: (i) => (i.is_active ? "ACTIVE" : "INACTIVE"),
    searchFields: [(i) => i.name],
  });

  /* ---------- ACTIONS ---------- */
  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
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
        resetPage(); // 🔑 same behavior as TaskList & IssueFlowList
      },
    },
  ];

  /* ---------- STATES ---------- */
  if (isLoading) {
    return (
      <PageLayout title="Institute Management">
        Loading institutes...
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout title="Institute Management">
        Error loading institutes.
      </PageLayout>
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
        title="Institute Management"
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={InstituteTableColumns}
          data={paginatedInstitutes}
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
