import {
  getV1ClassesIdInfoResponse,
  getV1ClassesIdResponse,
  getV1ClassesResponse,
  putV1ClassesIdResponse,
} from "@ou-ca/api/zod/species.zod";
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

export const useApiSpeciesClassQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1ClassesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/classes/${id}` : null,
    {
      schema: getV1ClassesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1ClassesIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/classes/${id}/info` : null,
    {
      schema: getV1ClassesIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1ClassesResponse>>,
) => {
  return useApiQuery(
    "/classes",
    {
      queryParams,
      schema: getV1ClassesResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1ClassesIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/classes",
    {
      queryParams,
      schema: getV1ClassesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassCreate = () => {
  return useApiFetch({
    path: "/classes",
    method: "POST",
    schema: putV1ClassesIdResponse,
  });
};

export const useApiSpeciesClassUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1ClassesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/classes/${id}` : null,
    {
      method: "PUT",
      schema: putV1ClassesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesClassDelete = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<unknown, unknown>,
) => {
  return useApiMutation(
    id ? `/classes/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
