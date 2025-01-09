import {
  getV1SpeciesIdInfoResponse,
  getV1SpeciesIdResponse,
  getV1SpeciesResponse,
  putV1SpeciesIdResponse,
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

export const useApiSpeciesQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1SpeciesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/species/${id}` : null,
    {
      schema: getV1SpeciesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesInfoQuery = (
  id: string | null,
  queryParams?: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1SpeciesIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/species/${id}/info` : null,
    {
      schema: getV1SpeciesIdInfoResponse,
      queryParams,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiSpeciesQueryAll = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1SpeciesResponse>>,
) =>
  useApiQuery(
    "/species",
    {
      queryParams,
      schema: getV1SpeciesResponse,
    },
    swrOptions,
  );

export const useApiSpeciesInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1SpeciesIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/species",
    {
      queryParams,
      schema: getV1SpeciesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesCreate = () => {
  return useApiFetch({
    path: "/species",
    method: "POST",
    schema: putV1SpeciesIdResponse,
  });
};

export const useApiSpeciesUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1SpeciesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/species/${id}` : null,
    {
      method: "PUT",
      schema: putV1SpeciesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiSpeciesDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/species/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
