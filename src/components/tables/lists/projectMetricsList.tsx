"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import DeleteModal from "../../common/DeleteModal";
import { ArrowLeft } from "lucide-react";

import {
  useDeleteProjectMetricMutation,
  useGetProjectMetricsQuery,
} from "../../../redux/services/projectMetricApi";
import { CreateProjectMetricModal } from "../../modals/CreateProjectMetricModal";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { useNavigate } from "react-router";
import Breadcrumbs from "../../common/Breadcrumbs";

export default function ProjectMetricsList() {
  const { search } = useGlobalSearch();
  const navigate = useNavigate();
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<any>(undefined);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const [deleteMetric, { isLoading: isDeleteLoading }] =
    useDeleteProjectMetricMutation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMetricId, setDeleteMetricId] = useState<string>("");

  const { data, isLoading, isError } = useGetProjectMetricsQuery({});

  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(
        data.map((m: any) => ({
          ...m,
          projects: m.projects || [],
          users: m.users || [],
        }))
      );
    }
  }, [data, isError, isLoading]);

  // Filter + Global search
  const filteredMetrics = useMemo(() => {
    return response.filter((item) => {
      if (statusFilter === "ACTIVE" && !item.is_active) return false;
      if (statusFilter === "INACTIVE" && item.is_active) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });
  }, [response, statusFilter, search]);

  useEffect(() => {
    setFilteredResponse(filteredMetrics);
    setPageDetail((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filteredMetrics]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  // --- Table columns ---
  const metricColumns = [
    {
      accessorKey: "project.id",
      header: "#",
      cell: ({ row }: any) => <div>{row.index + 1}</div>,
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
      id: "actions",
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

  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus />,
      variant: "default",
      size: "default",
      onClick: () => {
        setEditingMetric(undefined);
        setModalOpen(true);
      },
    },
  ];

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
          data={filteredResponse}
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
