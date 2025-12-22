import { useMemo, useState } from "react";

interface UseTablePaginationProps<T> {
  data: T[];
  search: string;
  searchFields: ((item: T) => string | undefined)[];
  statusFilter?: string;
  statusAccessor?: (item: T) => string;
  initialPageSize?: number;
}

export function useTablePagination<T>({
  data,
  search,
  searchFields,
  statusFilter = "all",
  statusAccessor,
  initialPageSize = 10,
}: UseTablePaginationProps<T>) {
  const [pageDetail, setPageDetail] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
    pageCount: 1,
  });

  const paginatedData = useMemo(() => {
    const q = search.toLowerCase();

    // 1️⃣ Filter
    const filtered = data.filter((item) => {
      const statusMatch =
        !statusAccessor ||
        statusFilter === "all" ||
        statusAccessor(item) === statusFilter;

      const searchMatch =
        !search ||
        searchFields.some((fn) =>
          fn(item)?.toLowerCase().includes(q)
        );

      return statusMatch && searchMatch;
    });

    // 2️⃣ Update page count
    const pageCount =
      Math.ceil(filtered.length / pageDetail.pageSize) || 1;

    // ⚠️ keep pageIndex valid
    const pageIndex =
      pageDetail.pageIndex >= pageCount ? 0 : pageDetail.pageIndex;

    if (
      pageCount !== pageDetail.pageCount ||
      pageIndex !== pageDetail.pageIndex
    ) {
      setPageDetail((prev) => ({
        ...prev,
        pageCount,
        pageIndex,
      }));
    }

    // 3️⃣ Slice
    const start = pageIndex * pageDetail.pageSize;
    return filtered.slice(start, start + pageDetail.pageSize);
  }, [
    data,
    search,
    statusFilter,
    pageDetail.pageIndex,
    pageDetail.pageSize,
  ]);

  const handlePagination = (pageIndex: number, pageSize: number) => {
    setPageDetail((prev) => ({
      ...prev,
      pageIndex,
      pageSize,
    }));
  };

  const resetPage = () =>
    setPageDetail((prev) => ({ ...prev, pageIndex: 0 }));

  return {
    data: paginatedData,
    pageDetail,
    handlePagination,
    resetPage,
    setPageDetail,
  };
}
