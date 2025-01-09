import {
  getV1LocalitiesIdInfoResponse,
  getV1LocalitiesIdResponse,
  getV1LocalitiesResponse,
  putV1LocalitiesIdResponse,
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

export const useApiLocalityQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1LocalitiesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/localitys/${id}` : null,
    {
      schema: getV1LocalitiesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiLocalityInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1LocalitiesIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/localities/${id}/info` : null,
    {
      schema: getV1LocalitiesIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiLocalitiesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1LocalitiesResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    "/localities",
    {
      queryParams,
      schema: getV1LocalitiesResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiLocalitiesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1LocalitiesIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/localities",
    {
      queryParams,
      schema: getV1LocalitiesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiLocalityCreate = () => {
  return useApiFetch({
    path: "/localities",
    method: "POST",
    schema: putV1LocalitiesIdResponse,
  });
};

export const useApiLocalityUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1LocalitiesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/localities/${id}` : null,
    {
      method: "PUT",
      schema: putV1LocalitiesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiLocalityDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/localities/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
