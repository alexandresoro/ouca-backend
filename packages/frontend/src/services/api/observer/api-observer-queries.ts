import {
  deleteV1ObserversIdResponse,
  getV1ObserversIdInfoResponse,
  getV1ObserversIdResponse,
  getV1ObserversResponse,
  putV1ObserversIdResponse,
} from "@ou-ca/api/zod/observer.zod";
import { useApiFetch } from "@services/api/useApiFetch";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { SWRMutationConfiguration } from "swr/mutation";
import type { z } from "zod";

export const useApiObserverQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1ObserversIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/observers/${id}` : null,
    {
      schema: getV1ObserversIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiObserverInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1ObserversIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/observers/${id}/info` : null,
    {
      schema: getV1ObserversIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiObserversQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1ObserversResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    "/observers",
    {
      queryParams,
      schema: getV1ObserversResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiObserversInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1ObserversIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/observers",
    {
      queryParams,
      schema: getV1ObserversResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiObserverCreate = () => {
  return useApiFetch({
    path: "/observers",
    method: "POST",
    schema: putV1ObserversIdResponse,
  });
};

export const useApiObserverUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1ObserversIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/observers/${id}` : null,
    {
      method: "PUT",
      schema: putV1ObserversIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiObserverDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof deleteV1ObserversIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/observers/${id}` : null,
    {
      method: "DELETE",
      schema: deleteV1ObserversIdResponse,
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
