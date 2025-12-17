"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { CreateCategoryModal } from "../../modals/CreateCategoryModal";
import {
  useGetIssueCategoriesQuery,
  useDeleteIssueCategoryMutation,
} from "../../../redux/services/issueCategoryApi";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { toast } from "sonner";

export default function IssueCategoryList() {
  const [response, setResponse] = useState<any[]>([]);
  const [filteredResponse, setFilteredResponse] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(undefined);
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageCount: 1,
    pageSize: 10,
  });

  const { search } = useGlobalSearch();
  const { data, isLoading, isError, refetch } = useGetIssueCategoriesQuery();
  const [deleteCategory] = useDeleteIssueCategoryMutation();

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id)
      .unwrap()
      .then(() => toast.success("Category deleted successfully"))
      .catch(() => toast.error("Failed to delete category"));
  };

  // ---------------- FILTER + SEARCH ----------------
  useEffect(() => {
    if (!isError && !isLoading && data) {
      setResponse(data);
    }
  }, [data, isError, isLoading]);

  useEffect(() => {
    const filtered = response.filter((item) => {
      const matchesSearch = search
        ? item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesSearch;
    });
    setFilteredResponse(filtered);
  }, [response, search]);

  const handlePagination = (index: number, size: number) => {
    setPageDetail({ ...pageDetail, pageIndex: index, pageSize: size });
  };

  // ---------------- TABLE COLUMNS ----------------
  const CategoryTableColumns = [
    {
      id: "serial",
      header: "#",
      cell: ({ row }: any) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Category Name",
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
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const category = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleEdit(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => handleDelete(category.category_id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading)
    return <PageLayout title="Support Categories">Loading...</PageLayout>;
  if (isError)
    return (
      <PageLayout title="Support Categories">
        <Button onClick={refetch}>Retry</Button>
      </PageLayout>
    );

  return (
    <>
      <PageLayout
        title="Support Categories"
        filters={[]} // Add filters if needed
        filterColumnsPerRow={1}
        actions={[
          {
            label: "Create",
            icon: <Plus />,
            variant: "default",
            size: "default",
            onClick: () => {
              setEditingCategory(undefined);
              setModalOpen(true);
            },
          },
        ]}
      >
        <DataTable
          columns={CategoryTableColumns}
          data={filteredResponse}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editingCategory}
      />
    </>
  );
}
