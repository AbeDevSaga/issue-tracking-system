"use client";

import { useEffect, useState } from "react";
import { Plus, Eye } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

import {
  useDeleteInternalNodeMutation,
  useGetInternalNodesQuery,
} from "../../../redux/services/internalNodeApi";

import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
// import { CreateInternalNodeModal } from "../../modals/CreateInternalNodeModal";
import HierarchyD3TreeInstitute from "./HierarchyD3TreeInstitute";
import { CreateInternalNodeModal } from "../../modals/CreateInternalNodeModal";

interface IssueFlowListProps {
  toggleActions?: ActionButton[];
  isAssignUsersToStructure?: boolean;
}

// ------------------- Component -------------------
export default function IssueFlowList({
  toggleActions,
  isAssignUsersToStructure,
}: IssueFlowListProps) {
  const { data, isLoading, isError } = useGetInternalNodesQuery();
  const [deleteNode] = useDeleteInternalNodeMutation();

  const [nodes, setNodes] = useState<any[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [toggleView, setToggleView] = useState("table");
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });
  const { pathname } = useLocation();
  console.log(pathname, "this is the pathname");

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
      setNodes(data || []);
      setFilteredNodes(data || []);
    }
  }, [data, isError, isLoading]);

  useEffect(() => {
    const filtered = nodes.filter((item) => {
      if (!statusFilter || statusFilter === "all") return true;
      if (statusFilter === "ACTIVE") return item.is_active;
      if (statusFilter === "INACTIVE") return !item.is_active;
      return true;
    });
    setFilteredNodes(filtered);
  }, [nodes, statusFilter]);

  // const handlePagination = (index: number, size: number) => {
  //   setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  // };

  console.log(
    filteredNodes.length > 0 ? true : false,
    filteredNodes,
    "this is the filtered nodes"
  );
  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        toggleActions={toggleActions}
        showtoggle={false}
        toggle={toggleView}
        onToggle={(value: string) => setToggleView(value)}
      >
        {/* {toggleView === "table" ? (
          <DataTable
            columns={InternalNodeTableColumns(deleteNode)}
            data={filteredNodes}
            handlePagination={handlePagination}
            tablePageSize={pageDetail.pageSize}
            totalPageCount={pageDetail.pageCount}
            currentIndex={pageDetail.pageIndex}
          />
        ) : (
          <HierarchyD3TreeInstitute data={filteredNodes} isLoading={isLoading} />
        )} */}
        <HierarchyD3TreeInstitute
          isAssignUsersToStructure={isAssignUsersToStructure}
          data={filteredNodes}
          isLoading={isLoading}
        />
      </PageLayout>

      <CreateInternalNodeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
