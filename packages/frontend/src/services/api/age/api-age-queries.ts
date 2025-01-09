import {
  getV1AgesIdInfoResponse,
  getV1AgesIdResponse,
  getV1AgesResponse,
  putV1AgesIdResponse,
} from "@ou-ca/api/zod/age.zod";
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

export const useApiAgeQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1AgesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/ages/${id}` : null,
    {
      schema: getV1AgesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiAgeInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1AgesIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/ages/${id}/info` : null,
    {
      schema: getV1AgesIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiAgesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1AgesResponse>>,
) => {
  return useApiQuery(
    "/ages",
    {
      queryParams,
      schema: getV1AgesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiAgesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1AgesIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/ages",
    {
      queryParams,
      schema: getV1AgesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiAgeCreate = () => {
  return useApiFetch({
    path: "/ages",
    method: "POST",
    schema: putV1AgesIdResponse,
  });
};

export const useApiAgeUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1AgesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/ages/${id}` : null,
    {
      method: "PUT",
      schema: putV1AgesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiAgeDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/ages/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
