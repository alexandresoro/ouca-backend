import { importStatusSchema } from "@ou-ca/common/import/import-status";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiImportStatusQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof importStatusSchema>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    id != null ? `/import/status/${id}` : null,
    {
      schema: importStatusSchema,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};
