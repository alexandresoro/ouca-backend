import {
  getV1SexesIdInfoResponse,
  getV1SexesIdResponse,
  getV1SexesResponse,
  putV1SexesIdResponse,
} from "@ou-ca/api/zod/sex.zod";
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

export const useApiSexQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1SexesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/sexes/${id}` : null,
    {
      schema: getV1SexesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1SexesIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/sexes/${id}/info` : null,
    {
      schema: getV1SexesIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1SexesResponse>>,
) => {
  return useApiQuery(
    "/sexes",
    {
      queryParams,
      schema: getV1SexesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSexesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1SexesIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/sexes",
    {
      queryParams,
      schema: getV1SexesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiSexCreate = () => {
  return useApiFetch({
    path: "/sexes",
    method: "POST",
    schema: putV1SexesIdResponse,
  });
};

export const useApiSexUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1SexesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/sexes/${id}` : null,
    {
      method: "PUT",
      schema: putV1SexesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiSexDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/sexes/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
