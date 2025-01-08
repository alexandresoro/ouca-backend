import { getV1ImportStatusImportIdResponse } from "@ou-ca/api/zod/import.zod";
import { type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiImportStatusQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1ImportStatusImportIdResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    id != null ? `/import/status/${id}` : null,
    {
      schema: getV1ImportStatusImportIdResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};
