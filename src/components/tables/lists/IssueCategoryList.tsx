"use client";
import { useNavigate } from "react-router-dom";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { CreateCategoryModal } from "../../modals/CreateCategoryModal";
import { ArrowLeft } from "lucide-react";

import {
  useGetIssueCategoriesQuery,
  useDeleteIssueCategoryMutation,
} from "../../../redux/services/issueCategoryApi";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { toast } from "sonner";
import Breadcrumbs from "../../common/Breadcrumbs";

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
  const navigate = useNavigate();
  const { search } = useGlobalSearch();
  const { data, isLoading, isError, refetch } = useGetIssueCategoriesQuery();
  const [deleteCategory] = useDeleteIssueCategoryMutation();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCategory(deleteTarget.category_id).unwrap();
      toast.success("Category deleted successfully");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete category");
    }
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
              onClick={() => {
                setDeleteTarget(category);
                setIsDeleteOpen(true);
              }}
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
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Category
            </h2>

            <p className="text-sm text-warning-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteTarget(null);
                }}
              >
                Cancel
              </Button>

              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
