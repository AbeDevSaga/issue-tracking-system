"use client";

import { useEffect, useState } from "react";
import { Plus, Eye } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  useDeleteInternalNodeMutation,
  useGetInternalNodesQuery,
} from "../../../redux/services/internalNodeApi";
import { ArrowLeft } from "lucide-react";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateInternalNodeModal } from "../../modals/CreateInternalNodeModal";
import HierarchyD3TreeInstitute from "./HierarchyD3TreeInstitute";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import Breadcrumbs from "../../common/Breadcrumbs";

interface IssueFlowListProps {
  toggleActions?: ActionButton[];
  isAssignUsersToStructure?: boolean;
}

export default function IssueFlowList({
  toggleActions,
  isAssignUsersToStructure,
}: IssueFlowListProps) {
  const { data, isLoading, isError } = useGetInternalNodesQuery();
  const [deleteNode] = useDeleteInternalNodeMutation();
  const { search } = useGlobalSearch();

  const [nodes, setNodes] = useState<any[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [toggleView, setToggleView] = useState<"table" | "tree">("table");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const InternalNodeTableColumns = [
    {
      id: "serial",
      header: "#",
      cell: ({ row }: any) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Support Request Flow Name",
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "parent",
      header: "Parent Request Flow",
      cell: ({ row }: any) => (
        <div>{row.original.parent?.name || "No Parent"}</div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => {
        const isActive = row.getValue("is_active");
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
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const node = row.original;
        const toggle = !pathname.startsWith("/inistitutes/project");

        return (
          <div className="flex items-center space-x-2">
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
          </div>
        );
      },
    },
  ];

  const actions: ActionButton[] = [
    {
      label: "Add",
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
        setPageDetail((prev) => ({ ...prev, pageIndex: 0 }));
      },
    },
  ];

  useEffect(() => {
    if (!isError && !isLoading && data) {
      setNodes(data || []);
      setFilteredNodes(data || []);
    }
  }, [data, isError, isLoading]);

  // ✅ Apply global search + status filter
  useEffect(() => {
    const lowerSearch = search.toLowerCase();

    const filtered = nodes.filter((node) => {
      const statusMatch =
        !statusFilter ||
        statusFilter === "all" ||
        (statusFilter === "ACTIVE" && node.is_active) ||
        (statusFilter === "INACTIVE" && !node.is_active);

      const searchMatch =
        !search ||
        node.name?.toLowerCase().includes(lowerSearch) ||
        node.parent?.name?.toLowerCase().includes(lowerSearch);

      return statusMatch && searchMatch;
    });

    setFilteredNodes(filtered);
    setPageDetail((prev) => ({ ...prev, pageIndex: 0 }));
  }, [nodes, statusFilter, search]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

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
        title="Support Request Flow Management"
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
        showtoggle
        toggle={toggleView}
        onToggle={(value: string) => setToggleView(value)}
      >
        {toggleView === "table" ? (
          <DataTable
            columns={InternalNodeTableColumns}
            data={filteredNodes}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={pageDetail.pageCount}
            currentIndex={pageDetail.pageIndex}
          />
        ) : (
          <HierarchyD3TreeInstitute
            isAssignUsersToStructure={isAssignUsersToStructure}
            data={filteredNodes}
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
