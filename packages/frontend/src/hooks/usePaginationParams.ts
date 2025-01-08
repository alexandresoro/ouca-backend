import { useState } from "react";

export type SortOrder = "asc" | "desc";

export type PaginationParams<T> = {
  query: string;
  setQuery: (query: string) => void;
  orderBy: T | undefined;
  setOrderBy: (orderBy: T | undefined) => void;
  sortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
};

const usePaginationParams = <T>(options?: { orderBy?: T; sortOrder?: SortOrder }): PaginationParams<T> => {
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState<T | undefined>(options?.orderBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(options?.sortOrder ?? "asc");

  return {
    query,
    setQuery,
    orderBy,
    setOrderBy,
    sortOrder,
    setSortOrder,
  };
};

export default usePaginationParams;
