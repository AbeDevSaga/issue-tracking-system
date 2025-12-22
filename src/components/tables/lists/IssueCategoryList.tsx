"use client";

import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "../../ui/cn/button";
import { PageLayout } from "../../common/PageLayout";
import { DataTable } from "../../common/CommonTable";
import { CreateCategoryModal } from "../../modals/CreateCategoryModal";
import { useGlobalSearch } from "../../../context/GlobalSearchContext";
import { toast } from "sonner";
import Breadcrumbs from "../../common/Breadcrumbs";

import {
  useGetIssueCategoriesQuery,
  useDeleteIssueCategoryMutation,
} from "../../../redux/services/issueCategoryApi";

import { useTablePagination } from "../../../hooks/useTablePagination";

export default function IssueCategoryList() {
  const navigate = useNavigate();
  const { search } = useGlobalSearch();

  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(undefined);

  const [deleteCategoryId, setDeleteCategoryId] = useState<string>("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetIssueCategoriesQuery();
  const [deleteCategory] = useDeleteIssueCategoryMutation();

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setCategories(data);
    }
  }, [data, isLoading, isError]);

  /* ---------- SAFE DATA ---------- */
  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  /* ---------- PAGINATION + SEARCH ---------- */
  const {
    data: paginatedCategories,
    pageDetail,
    handlePagination,
    resetPage,
  } = useTablePagination({
    data: safeCategories,
    search,
    searchFields: [(c) => c.name ?? "", (c) => c.description ?? ""],
    pageSize: 10,
  });

  /* ---------- TABLE COLUMNS ---------- */
  const CategoryTableColumns = [
    {
      header: "#",
      cell: ({ row }: any) =>
        row.index + 1 + pageDetail.pageIndex * pageDetail.pageSize,
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
      header: "Actions",
      cell: ({ row }: any) => {
        const category = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setEditingCategory(category);
                setModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => {
                setDeleteCategoryId(category.category_id);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  /* ---------- ACTIONS ---------- */
  const actions = [
    {
      label: "Create",
      icon: <Plus className="h-4 w-4" />,
      variant: "default",
      size: "default",
      onClick: () => {
        setEditingCategory(undefined);
        setModalOpen(true);
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
        filters={[]} // add filters if needed
        filterColumnsPerRow={1}
        actions={actions}
      >
        <DataTable
          columns={CategoryTableColumns}
          data={paginatedCategories}
          handlePagination={handlePagination}
          tablePageSize={pageDetail.pageSize}
          totalPageCount={pageDetail.pageCount}
          currentIndex={pageDetail.pageIndex}
        />
      </PageLayout>

      {/* Create / Edit Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editingCategory}
      />

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Category
            </h2>
            <p className="text-sm text-warning-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {
                  categories.find((c) => c.category_id === deleteCategoryId)
                    ?.name
                }
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await deleteCategory(deleteCategoryId).unwrap();
                    toast.success("Category deleted successfully");
                    setDeleteModalOpen(false);
                  } catch {
                    toast.error("Failed to delete category");
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
