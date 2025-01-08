import type { z } from "zod";

// Type that represents the zod schema expected to work with the paginated response used inb the useApiInfiniteQuery hook
export type PaginatedResponseSchemaType<T extends z.ZodTypeAny> = z.ZodObject<
  {
    data: z.ZodArray<T>;
    meta: z.ZodObject<{
      pageNumber: z.ZodOptional<z.ZodNumber>;
      pageSize: z.ZodOptional<z.ZodNumber>;
      count: z.ZodNumber;
    }>;
  },
  "strip"
>;
