"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { ArrowLeft } from "lucide-react";

import {
  IssueResponseTime,
  useGetIssueResponseTimesQuery,
  useDeleteIssueResponseTimeMutation,
} from "../../../redux/services/issueResponseTimeApi";
import DeleteModal from "../../common/DeleteModal";
import { ResponseTimeModal } from "../../modals/CreateResponseTimeModal";
import { useNavigate } from "react-router";
import Breadcrumbs from "../../common/Breadcrumbs";

export default function IssueResponseTimeList() {
  const [response, setResponse] = useState<IssueResponseTime[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<IssueResponseTime[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingResponseTime, setEditingResponseTime] = useState<
    IssueResponseTime | undefined
  >(undefined);

  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const [deleteResponseTime, { isLoading: isDeleteLoading }] =
    useDeleteIssueResponseTimeMutation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteResponseTimeId, setDeleteResponseTimeId] = useState<string>("");

  const { data, isLoading, isError } = useGetIssueResponseTimesQuery();

  // Populate table data
  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data?.data || []);
      setFilteredResponse(data?.data || []);
    }
  }, [data, isError, isLoading]);

  // Apply status filter
  useEffect(() => {
    const filtered = response.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      if (statusFilter === "ACTIVE") return item.is_active;
      if (statusFilter === "INACTIVE") return !item.is_active;
      return true;
    });
    setFilteredResponse(filtered);
  }, [response, statusFilter]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  // Table columns
  const ResponseTimeTableColumns = [
    {
      accessorKey: "project.id",
      header: "#",
      minSize: 50,
      cell: ({ row }: any) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      minSize: 50,
      cell: ({ row }: any) => <div>{row.getValue("duration")}</div>,
    },
    {
      accessorKey: "unit",
      header: "Unit",
      minSize: 50,
      cell: ({ row }: any) => <div>{row.getValue("unit")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      minSize: 100,
      cell: ({ row }: any) => {
        const item: IssueResponseTime = row.original;
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
                setEditingResponseTime(item); // set item to edit
                setModalOpen(true); // open modal
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => {
                setDeleteModalOpen(true);
                setDeleteResponseTimeId(item.response_time_id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Page actions
  const actions: ActionButton[] = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => {
        setEditingResponseTime(undefined); // ensure modal is in create mode
        setModalOpen(true);
      },
    },
  ];

  // Filters
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
        filters={filterFields}
        title=" Response Time Management"
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={ResponseTimeTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      {/* Modal for create/edit */}
      <ResponseTimeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        existingResponseTime={editingResponseTime}
      />

      {/* Delete confirmation */}
      <DeleteModal
        message="Are you sure you want to delete this response time?"
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={() => {
          deleteResponseTime(deleteResponseTimeId).unwrap();
          setDeleteModalOpen(false);
        }}
        open={isDeleteModalOpen}
        isLoading={isDeleteLoading || isLoading}
      />
    </>
  );
}
