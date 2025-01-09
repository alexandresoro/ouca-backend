import { type getV1EntriesIdResponse, getV1EntriesResponse, putV1EntriesIdResponse } from "@ou-ca/api/zod/entry.zod";
import { useApiFetch } from "@services/api/useApiFetch";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
import type { z } from "zod";

export const useApiEntriesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1EntriesResponse>>,
  { paused = false } = {},
) =>
  useApiQuery(
    "/entries",
    {
      queryParams,
      schema: getV1EntriesResponse,
      paused,
    },
    swrOptions,
  );

export const useApiEntriesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1EntriesIdResponse>,
  { paused = false } = {},
) => {
  return useApiInfiniteQuery(
    paused ? null : "/entries",
    {
      queryParams,
      schema: getV1EntriesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiEntryCreate = () => {
  return useApiFetch({
    path: "/entries",
    method: "POST",
    schema: putV1EntriesIdResponse,
  });
};

export const useApiEntryUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1EntriesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/entries/${id}` : null,
    {
      method: "PUT",
      schema: putV1EntriesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiEntryDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/entries/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
