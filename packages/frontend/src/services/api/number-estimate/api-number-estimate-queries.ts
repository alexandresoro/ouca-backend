import {
  getV1NumberEstimatesIdInfoResponse,
  getV1NumberEstimatesIdResponse,
  getV1NumberEstimatesResponse,
  putV1NumberEstimatesIdResponse,
} from "@ou-ca/api/zod/quantity.zod";
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

export const useApiNumberEstimateQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1NumberEstimatesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/number-estimates/${id}` : null,
    {
      schema: getV1NumberEstimatesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimateInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1NumberEstimatesIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/number-estimates/${id}/info` : null,
    {
      schema: getV1NumberEstimatesIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimatesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1NumberEstimatesResponse>>,
) => {
  return useApiQuery(
    "/number-estimates",
    {
      queryParams,
      schema: getV1NumberEstimatesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimatesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1NumberEstimatesIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/number-estimates",
    {
      queryParams,
      schema: getV1NumberEstimatesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimateCreate = () => {
  return useApiFetch({
    path: "/number-estimates",
    method: "POST",
    schema: putV1NumberEstimatesIdResponse,
  });
};

export const useApiNumberEstimateUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1NumberEstimatesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/number-estimates/${id}` : null,
    {
      method: "PUT",
      schema: putV1NumberEstimatesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiNumberEstimateDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<unknown, unknown>,
) => {
  return useApiMutation(
    id ? `/number-estimates/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
