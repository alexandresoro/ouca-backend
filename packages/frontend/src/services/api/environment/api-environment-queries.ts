import {
  getV1EnvironmentsIdInfoResponse,
  getV1EnvironmentsIdResponse,
  getV1EnvironmentsResponse,
  putV1EnvironmentsIdResponse,
} from "@ou-ca/api/zod/environment.zod";
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

export const useApiEnvironmentQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1EnvironmentsIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/environments/${id}` : null,
    {
      schema: getV1EnvironmentsIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1EnvironmentsIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/environments/${id}/info` : null,
    {
      schema: getV1EnvironmentsIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1EnvironmentsResponse>>,
) => {
  return useApiQuery(
    "/environments",
    {
      queryParams,
      schema: getV1EnvironmentsResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1EnvironmentsIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/environments",
    {
      queryParams,
      schema: getV1EnvironmentsResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentCreate = () => {
  return useApiFetch({
    path: "/environments",
    method: "POST",
    schema: putV1EnvironmentsIdResponse,
  });
};

export const useApiEnvironmentUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1EnvironmentsIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/environments/${id}` : null,
    {
      method: "PUT",
      schema: putV1EnvironmentsIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiEnvironmentDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/environments/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
