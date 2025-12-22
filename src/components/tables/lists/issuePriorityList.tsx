"use client";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { CreatePriorityModal } from "../../modals/CreatePriorityModal";
import DeleteModal from "../../common/DeleteModal";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import Breadcrumbs from "../../common/Breadcrumbs";
import { ArrowLeft } from "lucide-react";

import {
  useGetIssuePrioritiesQuery,
  useDeleteIssuePriorityMutation,
  IssuePriority,
} from "../../../redux/services/issuePriorityApi";

export default function IssuePriorityList() {
  const { search } = useGlobalSearch(); // ✅ Global search
  const [priorities, setPriorities] = useState<IssuePriority[]>([]);
  const [filteredPriorities, setFilteredPriorities] = useState<IssuePriority[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<IssuePriority | null>(
    null
  );
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const navigate = useNavigate();
  const [deletePriority, { isLoading: isDeleteLoading }] =
    useDeleteIssuePriorityMutation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePriorityId, setDeletePriorityId] = useState<string>("");

  const { data, isLoading, isError } = useGetIssuePrioritiesQuery();

  // ---------------- TABLE COLUMNS ----------------
  const PriorityTableColumns = [
    {
      id: "serial",
      header: "#",
      cell: ({ row }: any) => <div>{row.index + 1}</div>,
    },
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
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const priority = row.original;
        return (
          <div className="flex items-center space-x-2">
            {/* <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button> */}
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

  // ---------------- DATA LOAD ----------------
  useEffect(() => {
    if (!isError && !isLoading && data) {
      setPriorities(data.data || []);
    }
  }, [data, isError, isLoading]);

  // ---------------- FILTER + SEARCH ----------------
  useEffect(() => {
    const filtered = priorities.filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "ACTIVE" && !item.is_active) return false;
        if (statusFilter === "INACTIVE" && item.is_active) return false;
      }

      // Global search filter
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        );
      }

      return true;
    });

    setFilteredPriorities(filtered);
    setPageDetail((prev) => ({
      ...prev,
      pageCount: Math.ceil(filtered.length / prev.pageSize) || 1,
    }));
  }, [priorities, search, statusFilter, pageDetail.pageSize]);

  const handlePagination = (index: number, size: number) =>
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });

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
            onChange: (value: string | string[]) =>
              setStatusFilter(Array.isArray(value) ? value[0] : value),
          },
        ]}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={PriorityTableColumns}
          data={filteredPriorities}
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
