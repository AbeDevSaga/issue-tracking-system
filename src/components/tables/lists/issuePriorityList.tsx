"use client";

import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { CreatePriorityModal } from "../../modals/CreatePriorityModal";
import DeleteModal from "../../common/DeleteModal";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import Breadcrumbs from "../../common/Breadcrumbs";

import {
  useGetIssuePrioritiesQuery,
  useDeleteIssuePriorityMutation,
  IssuePriority,
} from "../../../redux/services/issuePriorityApi";

import { useTablePagination } from "../../../hooks/useTablePagination";

export default function IssuePriorityList() {
  const navigate = useNavigate();
  const { search } = useGlobalSearch();

  const [priorities, setPriorities] = useState<IssuePriority[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<IssuePriority | null>(
    null
  );

  const [deletePriorityId, setDeletePriorityId] = useState<string>("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetIssuePrioritiesQuery();
  const [deletePriority, { isLoading: isDeleteLoading }] =
    useDeleteIssuePriorityMutation();

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setPriorities(data.data || []);
    }
  }, [data, isLoading, isError]);

  /* ---------- SAFE DATA ---------- */
  const safePriorities = useMemo(
    () => (Array.isArray(priorities) ? priorities : []),
    [priorities]
  );

  /* ---------- PAGINATION + FILTER + SEARCH ---------- */
  const {
    data: paginatedPriorities,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safePriorities,
    search,
    statusFilter,
    statusAccessor: (p) => (p.is_active ? "ACTIVE" : "INACTIVE"),
    searchFields: [(p) => p.name ?? "", (p) => p.description ?? ""],
    pageSize: 10,
  });

  /* ---------- TABLE COLUMNS ---------- */
  const PriorityTableColumns = [
    { header: "#", cell: ({ row }: any) => row.index + 1 },
    {
      accessorKey: "name",
      header: "Priority Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => <div>{row.getValue("description") || "N/A"}</div>,
    },
    {
      accessorKey: "response_time",
      header: "Response Time",
      cell: ({ row }: any) => {
        const rt = row.original.responseTime;
        return rt ? `${rt.duration} ${rt.unit}` : "N/A";
      },
    },
    {
      header: "Actions",
      cell: ({ row }: any) => {
        const priority = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setEditingPriority(priority);
                setModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => {
                setDeletePriorityId(priority.priority_id);
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

  const actions = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => {
        setEditingPriority(null);
        setModalOpen(true);
      },
    },
  ];

  if (isLoading)
    return <PageLayout title="Priority Management">Loading...</PageLayout>;
  if (isError)
    return (
      <PageLayout title="Priority Management">
        Error loading priorities.
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
        title="Priority Management"
        filters={[
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
              resetPage(); // 🔑 reset pagination when filter changes
            },
          },
        ]}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={PriorityTableColumns}
          data={paginatedPriorities}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      <CreatePriorityModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        editingPriority={editingPriority}
      />

      <DeleteModal
        message="Are you sure you want to delete this priority?"
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={async () => {
          await deletePriority(deletePriorityId).unwrap();
          setDeleteModalOpen(false);
        }}
        open={isDeleteModalOpen}
        isLoading={isDeleteLoading || isLoading}
      />
    </>
  );
}
