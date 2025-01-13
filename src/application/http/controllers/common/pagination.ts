import { z } from "zod";

// INPUT
export const paginationQueryParamsSchema = z.object({
  pageNumber: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).optional(),
});

// OUTPUT
export const paginationMetadataSchema = z.object({
  pageNumber: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).optional(),
  count: z.number().min(0).int(),
});

type PaginationMetadata = z.infer<typeof paginationMetadataSchema>;

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

export const getPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataElement: T) =>
  z.object({
    data: z.array(dataElement),
    meta: paginationMetadataSchema,
  });
