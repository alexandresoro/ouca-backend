type PaginationOptions = Partial<{
  pageNumber: number | null;
  pageSize: number | null;
}>;

// Utility method to compute the SQL pagination from the API pagination
// Page number is starting at index 1
export const getSqlPagination = (
  paginationOptions: PaginationOptions | null | undefined,
): { offset: number | undefined; limit: number | undefined } => {
  return {
    offset:
      paginationOptions?.pageNumber != null && paginationOptions?.pageSize
        ? (paginationOptions.pageNumber - 1) * paginationOptions.pageSize
        : undefined,
    limit: paginationOptions?.pageSize ?? undefined,
  };
};
