"use client";

import React, { useState, useMemo } from "react";
import { Eye, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useTablePagination } from "../../../hooks/useTablePagination";
import { useGetCurrentUserQuery } from "../../../redux/services/authApi";
import { useMultipleIssuesQueries } from "../../../hooks/useMultipleIssuesQueries";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import Breadcrumbs from "../../common/Breadcrumbs";

import { FilterField } from "../../../types/layout";
import { formatStatus } from "../../../utils/statusFormatter";

/* ===================== TABLE COLUMNS ===================== */

const TaskTableColumns = [
  {
    header: "#",
    cell: ({ row }: any) => row.index + 1,
  },
  {
    header: "Ticket Number",
    cell: ({ row }: any) => row.original.ticket_number || "N/A",
  },
  {
    header: "Project",
    cell: ({ row }: any) => row.original.project?.name || "N/A",
  },
  {
    header: "Priority",
    cell: ({ row }: any) => row.original.priority?.name || "N/A",
  },
  {
    header: "Category",
    cell: ({ row }: any) => row.original.category?.name || "N/A",
  },
  {
    header: "Created By",
    cell: ({ row }: any) => row.original.reporter?.full_name || "N/A",
  },
  {
    header: "Structure",
    cell: ({ row }: any) => row.original.hierarchyNode?.name || "N/A",
  },
  {
    header: "Occurred Time",
    cell: ({ row }: any) =>
      row.original.issue_occured_time
        ? new Date(row.original.issue_occured_time).toLocaleString()
        : "N/A",
  },
  {
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.original.status;
      let bg = "bg-gray-100 text-gray-800";

      if (status === "pending") bg = "bg-yellow-100 text-yellow-800";
      if (status === "resolved") bg = "bg-green-100 text-green-800";
      if (status === "closed") bg = "bg-red-100 text-red-800";

      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}
        >
          {formatStatus(status)}
        </span>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }: any) => (
      <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
        <Link to={`/task/${row.original.issue_id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];

/* ===================== COMPONENT ===================== */

export default function TaskList() {
  const navigate = useNavigate();
  const { search } = useGlobalSearch();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  /* ---------- USER ---------- */
  const { data: loggedUser, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = loggedUser?.user?.user_id ?? "";

  /* ---------- PROJECT ROLES ---------- */
  const projectHierarchyPairs = useMemo(
    () =>
      (loggedUser?.user?.project_roles || []).map((role) => ({
        project_id: role.project?.project_id!,
        hierarchy_node_id: role.hierarchy_node?.hierarchy_node_id ?? null,
      })),
    [loggedUser]
  );

  /* ---------- FETCH ISSUES ---------- */
  const {
    allIssues,
    isLoading: issuesLoading,
    isError,
    errors,
  } = useMultipleIssuesQueries(projectHierarchyPairs, userId);

  /* ---------- SAFE DATA ---------- */
  const safeIssues = useMemo(
    () => (Array.isArray(allIssues?.issues) ? allIssues.issues : []),
    [allIssues]
  );

  /* ---------- PAGINATION + SEARCH + FILTER ---------- */
  const {
    data: paginatedIssues,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeIssues,
    search,
    statusFilter,
    statusAccessor: (issue) => issue.status,
    searchFields: [
      (i) => i.ticket_number,
      (i) => i.project?.name,
      (i) => i.priority?.name,
      (i) => i.category?.name,
      (i) => i.reporter?.full_name,
      (i) => i.hierarchyNode?.name,
      (i) => i.status,
    ],
  });

  /* ---------- FILTER UI ---------- */
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
      onChange: (value) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
        resetPage(); // 🔑 important
      },
    },
  ];

  /* ---------- STATES ---------- */
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
        <div className="text-red-600 p-4">
          Error loading tasks
          {errors?.map((e, i) => (
            <div key={i} className="text-sm text-gray-500">
              {JSON.stringify(e)}
            </div>
          ))}
        </div>
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

      <PageLayout filters={filterFields} filterColumnsPerRow={1}>
        <DataTable
          columns={TaskTableColumns}
          data={paginatedIssues}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
    </>
  );
}
