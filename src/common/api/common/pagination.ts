import { z } from "zod";

// INPUT
export const paginationQueryParamsSchema = z.object({
  pageNumber: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).optional(),
});

// OUTPUT
const paginationMetadataSchema = z.object({
  pageNumber: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).optional(),
  count: z.number().min(0).int(),
});

export type PaginationMetadata = z.infer<typeof paginationMetadataSchema>;

export const getPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataElement: T) =>
  z.object({
    data: z.array(dataElement),
    meta: paginationMetadataSchema,
  });
