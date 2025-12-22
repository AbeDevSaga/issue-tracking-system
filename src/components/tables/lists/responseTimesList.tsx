"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";

import {
  IssueResponseTime,
  useGetIssueResponseTimesQuery,
  useDeleteIssueResponseTimeMutation,
} from "../../../redux/services/issueResponseTimeApi";

import { useTablePagination } from "../../../hooks/useTablePagination";
import DeleteModal from "../../common/DeleteModal";
import { ResponseTimeModal } from "../../modals/CreateResponseTimeModal";
import { useNavigate } from "react-router";
import Breadcrumbs from "../../common/Breadcrumbs";

export default function IssueResponseTimeList() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>(""); // optional global search
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingResponseTime, setEditingResponseTime] =
    useState<IssueResponseTime>();
  const [responseTimes, setResponseTimes] = useState<IssueResponseTime[]>([]);

  const [deleteResponseTimeId, setDeleteResponseTimeId] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  /* ---------- API ---------- */
  const { data, isLoading, isError } = useGetIssueResponseTimesQuery();
  const [deleteResponseTime, { isLoading: isDeleteLoading }] =
    useDeleteIssueResponseTimeMutation();

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setResponseTimes(data?.data || []);
    }
  }, [data, isLoading, isError]);

  /* ---------- SAFE DATA ---------- */
  const safeResponseTimes = useMemo(
    () => (Array.isArray(responseTimes) ? responseTimes : []),
    [responseTimes]
  );

  /* ---------- PAGINATION + FILTER ---------- */
  const {
    data: paginatedResponseTimes,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeResponseTimes,
    search,
    statusFilter,
    statusAccessor: (r) => (r.is_active ? "ACTIVE" : "INACTIVE"),
    searchFields: [
      (r) => String(r.duration ?? ""),
      (r) => String(r.unit ?? ""),
    ],
    pageSize: 10,
  });

  /* ---------- TABLE COLUMNS ---------- */
  const ResponseTimeTableColumns = [
    { header: "#", cell: ({ row }: any) => row.index + 1 },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }: any) => row.getValue("duration"),
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }: any) => row.getValue("unit"),
    },
    {
      header: "Actions",
      cell: ({ row }: any) => {
        const item: IssueResponseTime = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setEditingResponseTime(item);
                setModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
              onClick={() => {
                setDeleteResponseTimeId(item.response_time_id);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  /* ---------- ACTIONS ---------- */
  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => {
        setEditingResponseTime(undefined);
        setModalOpen(true);
      },
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
        resetPage();
      },
    },
  ];

  if (isLoading)
    return <PageLayout title="Response Time Management">Loading...</PageLayout>;
  if (isError)
    return (
      <PageLayout title="Response Time Management">
        Failed to load data.
      </PageLayout>
    );

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
        title="Response Time Management"
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={ResponseTimeTableColumns}
          data={paginatedResponseTimes}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      {/* Create / Edit Modal */}
      <ResponseTimeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        existingResponseTime={editingResponseTime}
      />

      {/* Delete Confirmation */}
      <DeleteModal
        open={isDeleteModalOpen}
        message="Are you sure you want to delete this response time?"
        isLoading={isDeleteLoading}
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={() => {
          deleteResponseTime(deleteResponseTimeId).unwrap();
          setDeleteModalOpen(false);
        }}
      />
    </>
  );
}
