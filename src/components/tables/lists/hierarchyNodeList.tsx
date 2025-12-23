"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import {
  useDeleteHierarchyNodeMutation,
  useGetHierarchyNodesByProjectIdQuery,
} from "../../../redux/services/hierarchyNodeApi";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateHierarchyNodeModal } from "../../modals/CreateHierarchyNodeModal";
import HierarchyD3Tree from "./HierarchyD3Tree";

// Import hooks for search and pagination
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { useTablePagination } from "../../../hooks/useTablePagination";

// ------------------- Table Columns -------------------
const HierarchyNodeTableColumns = (deleteNode: any) => [
  {
    header: "#",
    cell: ({ row }: any) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Structure Name",
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
    accessorKey: "parent",
    header: "Parent Structure",
    cell: ({ row }: any) => {
      const parent = row.original.parent;
      return <div>{parent?.name || "No Parent"}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }: any) => {
      const isActive = row.getValue("is_active");
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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

      const handleDelete = async () => {
        if (confirm(`Delete node "${node.name}"?`)) {
          try {
            await deleteNode(node.hierarchy_node_id).unwrap();
            toast.success("Hierarchy node deleted successfully");
          } catch (err: any) {
            toast.error(err?.data?.message || "Error deleting node");
          }
        }
      };

      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
            <Link to={`/org_structure/${node.hierarchy_node_id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

interface HierarchyNodeListProps {
  project_id: string;
  inistitute_id?: string;
  toggleActions?: ActionButton[];
}

// ------------------- Component -------------------
export default function HierarchyNodeList({
  project_id,
  inistitute_id,
  toggleActions,
}: HierarchyNodeListProps) {
  // Get search from context
  const { search } = useGlobalSearch();

  const [nodes, setNodes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [toggleHierarchyNode, setToggleHierarchyNode] = useState("table");

  const { data, isLoading, isError } = useGetHierarchyNodesByProjectIdQuery(
    project_id,
    {
      skip: !project_id,
    }
  );
  const [deleteNode] = useDeleteHierarchyNodeMutation();

  const actions: ActionButton[] = [
    {
      label: "Add Structure",
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
      onChange: (value) => {
        setStatusFilter(Array.isArray(value) ? value[0] : value);
      },
    },
  ];

  // Load data
  useEffect(() => {
    if (!isError && !isLoading && data) {
      setNodes(Array.isArray(data) ? data : []);
    }
  }, [data, isError, isLoading]);

  // Safe data
  const safeNodes = useMemo(() => (Array.isArray(nodes) ? nodes : []), [nodes]);

  // Use the same pagination hook as InstituteList
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
    searchFields: [
      (node) => node.name,
      (node) => node.description,
      (node) => node.parent?.name,
    ],
  });

  // Update the filter change to reset page
  const updatedFilterFields: FilterField[] = filterFields.map((field) => {
    if (field.key === "status") {
      return {
        ...field,
        onChange: (value) => {
          setStatusFilter(Array.isArray(value) ? value[0] : value);
          resetPage(); // Reset to page 1 when filter changes
        },
      };
    }
    return field;
  });

  // Apply filters and search to ALL nodes for tree view
  const filteredNodes = useMemo(() => {
    let result = [...safeNodes];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((node) => {
        const status = node.is_active ? "ACTIVE" : "INACTIVE";
        return status === statusFilter;
      });
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((node) => {
        return (
          (node.name && node.name.toLowerCase().includes(searchLower)) ||
          (node.description &&
            node.description.toLowerCase().includes(searchLower)) ||
          (node.parent?.name &&
            node.parent.name.toLowerCase().includes(searchLower))
        );
      });
    }

    return result;
  }, [safeNodes, statusFilter, search]);

  return (
    <>
      <PageLayout
        filters={updatedFilterFields}
        title="Request Flow Structures"
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        actions={actions}
        showtoggle={true}
        toggle={toggleHierarchyNode}
        onToggle={(value: string) => setToggleHierarchyNode(value)}
      >
        {toggleHierarchyNode === "table" ? (
          <DataTable
            columns={HierarchyNodeTableColumns(deleteNode)}
            data={paginatedNodes}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={pageDetail.pageCount}
            currentIndex={pageDetail.pageIndex}
          />
        ) : (
          <HierarchyD3Tree
            inistitute_id={inistitute_id}
            data={filteredNodes}
            isLoading={isLoading}
          />
        )}
      </PageLayout>

      <CreateHierarchyNodeModal
        project_id={project_id}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
