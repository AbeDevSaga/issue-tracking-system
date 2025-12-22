"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Eye, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  useDeleteInternalNodeMutation,
  useGetInternalNodesQuery,
} from "../../../redux/services/internalNodeApi";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateInternalNodeModal } from "../../modals/CreateInternalNodeModal";
import HierarchyD3TreeInstitute from "./HierarchyD3TreeInstitute";
import Breadcrumbs from "../../common/Breadcrumbs";

import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { useTablePagination } from "../../../hooks/useTablePagination";

interface IssueFlowListProps {
  toggleActions?: ActionButton[];
  isAssignUsersToStructure?: boolean;
}

export default function IssueFlowList({
  toggleActions,
  isAssignUsersToStructure,
}: IssueFlowListProps) {
  /* ===================== HOOKS ===================== */
  const { data, isLoading, isError } = useGetInternalNodesQuery();
  const [deleteNode] = useDeleteInternalNodeMutation();
  const { search } = useGlobalSearch();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* ===================== STATE ===================== */
  const [nodes, setNodes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [toggleView, setToggleView] = useState<"table" | "tree">("table");

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setNodes(Array.isArray(data) ? data : []);
    }
  }, [data, isLoading, isError]);

  /* ===================== SAFE DATA ===================== */
  const safeNodes = useMemo(() => (Array.isArray(nodes) ? nodes : []), [nodes]);

  /* ===================== PAGINATION + SEARCH + FILTER ===================== */
  const {
    data: paginatedNodes,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeNodes,
    search,
    statusFilter,
    statusAccessor: (node) => (node.is_active ? "ACTIVE" : "INACTIVE"),
    searchFields: [(n) => n.name, (n) => n.parent?.name],
  });

  /* ===================== TABLE COLUMNS ===================== */
  const InternalNodeTableColumns = [
    {
      header: "#",
      cell: ({ row }: any) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Support Request Flow Name",
      cell: ({ row }: any) => (
        <span className="font-medium text-blue-600">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      header: "Parent Request Flow",
      cell: ({ row }: any) => row.original.parent?.name || "No Parent",
    },
    {
      header: "Status",
      cell: ({ row }: any) => {
        const isActive = row.original.is_active;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }: any) => {
        const node = row.original;
        const toggle = !pathname.startsWith("/inistitutes/project");

        return (
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link
              to={
                toggle
                  ? `/issue_configuration/${node.internal_node_id}`
                  : `/issue_flow/${node.internal_node_id}`
              }
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        );
      },
    },
  ];

  /* ===================== ACTIONS ===================== */
  const actions: ActionButton[] = [
    {
      label: "Add",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
    },
  ];

  /* ===================== FILTERS ===================== */
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
        resetPage(); // 🔑 same behavior as TaskList
      },
    },
  ];

  /* ===================== STATES ===================== */
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          Loading request flows...
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className="text-red-600 p-4">Error loading request flows</div>
      </PageLayout>
    );
  }

  /* ===================== UI ===================== */
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
        title="Support Request Flow Management"
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
        showtoggle
        toggle={toggleView}
        onToggle={(value: string) => setToggleView(value as "table" | "tree")}
      >
        {toggleView === "table" ? (
          <DataTable
            columns={InternalNodeTableColumns}
            data={paginatedNodes}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={pageDetail.pageCount}
            currentIndex={pageDetail.pageIndex}
          />
        ) : (
          <HierarchyD3TreeInstitute
            isAssignUsersToStructure={isAssignUsersToStructure}
            data={paginatedNodes}
            isLoading={isLoading}
          />
        )}
      </PageLayout>

      <CreateInternalNodeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
