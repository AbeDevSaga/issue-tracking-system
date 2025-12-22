"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { CreateProjectMetricModal } from "../../modals/CreateProjectMetricModal";
import DeleteModal from "../../common/DeleteModal";
import Breadcrumbs from "../../common/Breadcrumbs";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { useNavigate } from "react-router";

import {
  useGetProjectMetricsQuery,
  useDeleteProjectMetricMutation,
} from "../../../redux/services/projectMetricApi";

import { useTablePagination } from "../../../hooks/useTablePagination";

export default function ProjectMetricsList() {
  const navigate = useNavigate();
  const { search } = useGlobalSearch();

  const [metrics, setMetrics] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<any>(undefined);

  const [deleteMetricId, setDeleteMetricId] = useState<string>("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetProjectMetricsQuery({});
  const [deleteMetric, { isLoading: isDeleteLoading }] =
    useDeleteProjectMetricMutation();

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setMetrics(
        data.map((m: any) => ({
          ...m,
          projects: m.projects || [],
          users: m.users || [],
        }))
      );
    }
  }, [data, isLoading, isError]);

  /* ---------- SAFE DATA ---------- */
  const safeMetrics = useMemo(
    () => (Array.isArray(metrics) ? metrics : []),
    [metrics]
  );

  /* ---------- PAGINATION + FILTER + SEARCH ---------- */
  const {
    data: paginatedMetrics,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeMetrics,
    search,
    statusFilter,
    statusAccessor: (m) => (m.is_active ? "ACTIVE" : "INACTIVE"),
    searchFields: [(m) => m.name ?? "", (m) => m.description ?? ""],
    pageSize: 10,
  });

  /* ---------- TABLE COLUMNS ---------- */
  const metricColumns = [
    {
      header: "#",
      cell: ({ row }: any) =>
        row.index + 1 + pageDetail.pageIndex * pageDetail.pageSize,
    },
    {
      accessorKey: "name",
      header: "Human Resource Name",
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
      header: "Actions",
      cell: ({ row }: any) => {
        const metric = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setEditingMetric(metric);
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
                setDeleteMetricId(metric.project_metric_id);
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
  const actions = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => {
        setEditingMetric(undefined);
        setModalOpen(true);
      },
    },
  ];

  if (isLoading)
    return <PageLayout title="Project Metrics">Loading...</PageLayout>;
  if (isError)
    return (
      <PageLayout title="Project Metrics">Error loading metrics.</PageLayout>
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

      <PageLayout filters={[]} filterColumnsPerRow={1} actions={actions}>
        <DataTable
          columns={metricColumns}
          data={paginatedMetrics}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      <CreateProjectMetricModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        editingMetric={editingMetric}
      />

      <DeleteModal
        message="Are you sure you want to delete this metric?"
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={() => {
          deleteMetric(deleteMetricId).unwrap();
          setDeleteModalOpen(false);
        }}
        open={isDeleteModalOpen}
        isLoading={isDeleteLoading || isLoading}
      />
    </>
  );
}
