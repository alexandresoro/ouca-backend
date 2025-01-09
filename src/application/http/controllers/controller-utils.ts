import type { PaginationMetadata } from "@ou-ca/common/api/common/pagination.js";

export const getPaginationMetadata = (
  count: number,
  {
    pageNumber,
    pageSize,
  }: {
    pageNumber?: number;
    pageSize?: number;
  },
): PaginationMetadata => {
  return {
    count,
    ...(pageNumber != null && pageSize != null
      ? {
          pageNumber,
          pageSize,
        }
      : {}),
  };
};
