"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import {
  useGetIssueResponseTimesQuery,
  useDeleteIssueResponseTimeMutation,
} from "../../../redux/services/issueResponseTimeApi";
// import { CreateResponseTimeModal } from "../../modals/CreateResponseTimeModal";
import DeleteModal from "../../common/DeleteModal";
import { CreateResponseTimeModal } from "../../modals/CreateResponseTimeModal";

export default function IssueResponseTimeList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const [deleteResponseTime, { isLoading: isDeleteLoading }] =
    useDeleteIssueResponseTimeMutation();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteResponseTimeId, setDeleteResponseTimeId] = useState<string>("");

  // --- Define table columns ---
  const ResponseTimeTableColumns = [
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }: any) => <div>{row.getValue("duration")}</div>,
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }: any) => <div>{row.getValue("unit")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              // onClick={() => openViewModal(item)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              // onClick={() => openEditModal(item)}
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

  const { data, isLoading, isError } = useGetIssueResponseTimesQuery();

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

  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data?.data || []);
      setFilteredResponse(data?.data || []);
    }
  }, [data, isError, isLoading]);

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
    setPageDetail({
      ...pageDetail,
      pageIndex: index,
      pageSize: size,
    });
  };

  return (
    <>
      <PageLayout
        filters={filterFields}
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

      <CreateResponseTimeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />

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
