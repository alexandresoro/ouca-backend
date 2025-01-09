import {
  getV1TownsIdInfoResponse,
  getV1TownsIdResponse,
  getV1TownsResponse,
  putV1TownsIdResponse,
} from "@ou-ca/api/zod/location.zod";
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

export const useApiTownQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1TownsIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/towns/${id}` : null,
    {
      schema: getV1TownsIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiTownInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1TownsIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/towns/${id}/info` : null,
    {
      schema: getV1TownsIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiTownsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1TownsResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    "/towns",
    {
      queryParams,
      schema: getV1TownsResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiTownsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1TownsIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/towns",
    {
      queryParams,
      schema: getV1TownsResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiTownCreate = () => {
  return useApiFetch({
    path: "/towns",
    method: "POST",
    schema: putV1TownsIdResponse,
  });
};

export const useApiTownUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1TownsIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/towns/${id}` : null,
    {
      method: "PUT",
      schema: putV1TownsIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiTownDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/towns/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
