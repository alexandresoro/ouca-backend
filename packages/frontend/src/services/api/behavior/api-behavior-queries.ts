import {
  getV1BehaviorsIdInfoResponse,
  getV1BehaviorsIdResponse,
  getV1BehaviorsResponse,
  putV1BehaviorsIdResponse,
} from "@ou-ca/api/zod/behavior.zod";
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

export const useApiBehaviorQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1BehaviorsIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/behaviors/${id}` : null,
    {
      schema: getV1BehaviorsIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiBehaviorInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1BehaviorsIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/behaviors/${id}/info` : null,
    {
      schema: getV1BehaviorsIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiBehaviorsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1BehaviorsResponse>>,
) => {
  return useApiQuery(
    "/behaviors",
    {
      queryParams,
      schema: getV1BehaviorsResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiBehaviorsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1BehaviorsIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/behaviors",
    {
      queryParams,
      schema: getV1BehaviorsResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiBehaviorCreate = () => {
  return useApiFetch({
    path: "/behaviors",
    method: "POST",
    schema: putV1BehaviorsIdResponse,
  });
};

export const useApiBehaviorUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1BehaviorsIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/behaviors/${id}` : null,
    {
      method: "PUT",
      schema: putV1BehaviorsIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiBehaviorDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/behaviors/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
