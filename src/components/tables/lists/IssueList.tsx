"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useGetIssuesByUserIdQuery } from "../../../redux/services/issueApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { useGetCurrentUserQuery } from "../../../redux/services/authApi";
import { formatStatus } from "../../../utils/statusFormatter";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import Breadcrumbs from "../../common/Breadcrumbs";

// --- Table columns ---
const IssueTableColumns = [
  {
    accessorKey: "project.id",
    header: "#",
    cell: ({ row }: any) => row.index + 1,
  },
  {
    accessorKey: "project.ticket_number",
    header: "Ticket Number",
    cell: ({ row }: any) => row.original.ticket_number || "N/A",
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }: any) => row.original.project?.name || "N/A",
  },
  {
    accessorKey: "priority.name",
    header: "Priority",
    cell: ({ row }: any) => row.original.priority?.name || "N/A",
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }: any) => row.original.category?.name || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      let bgClass = "bg-gray-100 text-gray-800";
      if (status === "pending") bgClass = "bg-yellow-100 text-yellow-800";
      else if (status === "resolved") bgClass = "bg-green-100 text-green-800";
      else if (status === "closed") bgClass = "bg-red-100 text-red-800";

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass}`}
        >
          {formatStatus(status) || "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
          <Link to={`/issue/${row.original.issue_id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    ),
  },
];

export default function IssueList() {
  const navigate = useNavigate();
  const { search } = useGlobalSearch();
  const [response, setResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id ?? "";

  const { isLoading, isError, data } = useGetIssuesByUserIdQuery(userId, {
    skip: !userId,
  });

  useEffect(() => {
    if (!isError && !isLoading && data) setResponse(data);
  }, [data, isError, isLoading]);

  const actions: ActionButton[] = [
    {
      label: "Create Support Request",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => navigate("/add_issue"),
    },
  ];

  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
      ],
      value: statusFilter,
      onChange: (value: string | string[]) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
        setPageDetail((prev) => ({ ...prev, pageIndex: 0 }));
      },
    },
  ];

  // ---------------- Filter + Search + Pagination ----------------
  const filteredResponse = useMemo(() => {
    const safeData = Array.isArray(response) ? response : [];
    const filtered = safeData.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item.ticket_number?.toLowerCase().includes(q) ||
        item.project?.ticket_number?.toLowerCase().includes(q) ||
        item.project?.name?.toLowerCase().includes(q) ||
        item.priority?.name?.toLowerCase().includes(q) ||
        item.category?.name?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q)
      );
    });

    // update page count dynamically
    setPageDetail((prev) => ({
      ...prev,
      pageCount: Math.ceil(filtered.length / prev.pageSize) || 1,
    }));

    // slice data for current page
    const start = pageDetail.pageIndex * pageDetail.pageSize;
    return filtered.slice(start, start + pageDetail.pageSize);
  }, [
    response,
    statusFilter,
    search,
    pageDetail.pageIndex,
    pageDetail.pageSize,
  ]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageDetail({ ...pageDetail, pageSize: newSize, pageIndex: 0 });
  };

  if (userLoading || isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          Loading issues...
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64 text-red-600">
          Error loading issues.
        </div>
      </PageLayout>
    );
  }

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
        title="My Requests"
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={IssueTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
    </>
  );
}
