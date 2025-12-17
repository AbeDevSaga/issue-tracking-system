"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useGetProjectsByInstituteIdQuery,
  useDeleteProjectMutation,
} from "../../../redux/services/projectApi";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { ActionButton, FilterField } from "../../../types/layout";
import { CreateProjectModal } from "../../modals/CreateProjectModal";
import { isPermittedActionButton } from "../../../utils/guards/isPermittedActionButton";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";

interface ProjectListProps {
  userType: string;
  insistitute_id: string;
}

export default function ProjectList({
  insistitute_id,
  userType,
}: ProjectListProps) {
  const { search } = useGlobalSearch(); // ✅ global search
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } =
    useGetProjectsByInstituteIdQuery(insistitute_id);

  const ProjectTableColumns = [
    {
      id: "serial",
      header: "#",
      cell: ({ row }: any) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Project Name",
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
        const project = row.original;
        const projectLink =
          userType === "external_user"
            ? `/project/${project.project_id}`
            : `/inistitutes/project/${project.project_id}`;

        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
              <Link to={`${projectLink}`}>
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
      label: "Add Project",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => setModalOpen(true),
      allowedFor: ["internal_user"],
    },
  ];

  const permittedActions = actions.filter((action) =>
    isPermittedActionButton(action)
  );

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

  // ✅ Load data
  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data || []);
      setFilteredResponse(data || []);
    }
  }, [data, isError, isLoading]);

  // ✅ Apply status + search filter
  useEffect(() => {
    const lowerSearch = search.toLowerCase();

    const filtered = response.filter((project) => {
      const statusMatch =
        !statusFilter ||
        statusFilter === "all" ||
        (statusFilter === "ACTIVE" && project.is_active) ||
        (statusFilter === "INACTIVE" && !project.is_active);

      const searchMatch =
        !search ||
        project.name?.toLowerCase().includes(lowerSearch) ||
        project.description?.toLowerCase().includes(lowerSearch);

      return statusMatch && searchMatch;
    });

    setFilteredResponse(filtered);
    setPageDetail((prev) => ({ ...prev, pageIndex: 0 }));
  }, [response, statusFilter, search]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  return (
    <>
      <PageLayout
        filters={filterFields}
        filterColumnsPerRow={1}
        actions={permittedActions}
      >
        <DataTable
          columns={ProjectTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>
      <CreateProjectModal
        instituteId={insistitute_id}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
