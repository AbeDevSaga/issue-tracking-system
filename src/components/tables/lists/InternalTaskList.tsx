"use client";

import React, { useState, useMemo } from "react";
import { Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useGetCurrentUserQuery } from "../../../redux/services/authApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { FilterField } from "../../../types/layout";

import { useIssuesQuery } from "../../../hooks/useIssueQuery";
import { formatStatus } from "../../../utils/statusFormatter";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import Breadcrumbs from "../../common/Breadcrumbs";
import { useNavigate } from "react-router";
const TaskTableColumns = [
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
    accessorKey: "reporter.full_name",
    header: "Created By",
    cell: ({ row }: any) => row.original.reporter?.full_name || "N/A",
  },
  {
    accessorKey: "hierarchyNode.name",
    header: "Structure",
    cell: ({ row }: any) => row.original.hierarchyNode?.name || "N/A",
  },
  {
    accessorKey: "issue_occured_time",
    header: "Occurred Time",
    cell: ({ row }: any) =>
      row.original.issue_occured_time
        ? new Date(row.original.issue_occured_time).toLocaleString()
        : "N/A",
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
    cell: ({ row }: any) => {
      const issue = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/task_list/${issue.issue_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

export default function InternalTaskList() {
  const { search } = useGlobalSearch();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id || "";
  const userInternalNode =
    loggedUser?.user?.internal_project_roles?.[0]?.internal_node;

  const {
    data: allIssues,
    isLoading: issuesLoading,
    isError,
    error: errors,
  } = useIssuesQuery(userId, userInternalNode);

  // ---------------- FILTER + PAGINATION ----------------
  const filteredIssues = useMemo(() => {
    const safeIssues = Array.isArray(allIssues?.issues) ? allIssues.issues : [];

    const filtered = safeIssues.filter((issue) => {
      if (statusFilter !== "all" && issue.status !== statusFilter) return false;
      if (!search) return true;

      const q = search.toLowerCase();
      return (
        issue.ticket_number?.toLowerCase().includes(q) ||
        issue.priority?.name?.toLowerCase().includes(q) ||
        issue.category?.name?.toLowerCase().includes(q) ||
        issue.reporter?.full_name?.toLowerCase().includes(q) ||
        issue.hierarchyNode?.name?.toLowerCase().includes(q) ||
        issue.status?.toLowerCase().includes(q) ||
        (issue.issue_occured_time &&
          new Date(issue.issue_occured_time)
            .toLocaleString()
            .toLowerCase()
            .includes(q))
      );
    });

    // update page count
    setPageDetail((prev) => ({
      ...prev,
      pageCount: Math.ceil(filtered.length / prev.pageSize) || 1,
    }));

    const start = pageDetail.pageIndex * pageDetail.pageSize;
    return filtered.slice(start, start + pageDetail.pageSize);
  }, [
    allIssues,
    statusFilter,
    search,
    pageDetail.pageIndex,
    pageDetail.pageSize,
  ]);

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPageDetail({ pageIndex, pageSize, pageCount: pageDetail.pageCount });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageDetail({ ...pageDetail, pageSize: newSize, pageIndex: 0 });
  };

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
      onChange: (value: string | string[]) =>
        setStatusFilter(Array.isArray(value) ? value[0] : value),
    },
  ];

  if (userLoading || issuesLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          Loading tasks...
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64 text-red-600">
          Error loading tasks. Please try again.
          {errors && Array.isArray(errors) && errors.length > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              {errors.map((error, i) => (
                <div key={i}>Error: {JSON.stringify(error)}</div>
              ))}
            </div>
          )}
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
        filters={filterFields}
        title="My Task List"
        filterColumnsPerRow={1}
        actions={[
          <div key="pageSize" className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm">Rows per page:</span>
            <select
              value={pageDetail.pageSize}
              onChange={handlePageSizeChange}
              className="border rounded px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>,
        ]}
      >
        <DataTable
          columns={TaskTableColumns}
          data={filteredIssues}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
    </>
  );
}
