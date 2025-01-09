import {
  getV1DistanceEstimatesIdInfoResponse,
  getV1DistanceEstimatesIdResponse,
  getV1DistanceEstimatesResponse,
  putV1DistanceEstimatesIdBody,
} from "@ou-ca/api/zod/distance.zod";
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

export const useApiDistanceEstimateQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1DistanceEstimatesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/distance-estimates/${id}` : null,
    {
      schema: getV1DistanceEstimatesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimateInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1DistanceEstimatesIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/distance-estimates/${id}/info` : null,
    {
      schema: getV1DistanceEstimatesIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimatesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1DistanceEstimatesResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    "/distance-estimates",
    {
      queryParams,
      schema: getV1DistanceEstimatesResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimatesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1DistanceEstimatesIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/distance-estimates",
    {
      queryParams,
      schema: getV1DistanceEstimatesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimateCreate = () => {
  return useApiFetch({
    path: "/distance-estimates",
    method: "POST",
    schema: putV1DistanceEstimatesIdBody,
  });
};

export const useApiDistanceEstimateUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1DistanceEstimatesIdBody>, unknown>,
) => {
  return useApiMutation(
    id ? `/distance-estimates/${id}` : null,
    {
      method: "PUT",
      schema: putV1DistanceEstimatesIdBody,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiDistanceEstimateDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<unknown, unknown>,
) => {
  return useApiMutation(
    id ? `/distance-estimates/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
