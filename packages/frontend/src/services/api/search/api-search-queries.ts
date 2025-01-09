import { getV1SearchSpeciesResponse, type getV1SpeciesIdResponse } from "@ou-ca/api/zod/species.zod";
import {
  type UseApiInfiniteQueryCommonParams,
  type UseApiQuerySWRInfiniteOptions,
  useApiInfiniteQuery,
} from "@services/api/useApiInfiniteQuery";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { z } from "zod";

export const useApiSearchSpecies = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1SearchSpeciesResponse>>,
  { paused = false } = {},
) =>
  useApiQuery(
    "/search/species",
    {
      queryParams,
      schema: getV1SearchSpeciesResponse,
      paused,
    },
    swrOptions,
  );

export const useApiSearchInfiniteSpecies = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1SpeciesIdResponse>,
) =>
  useApiInfiniteQuery(
    "/search/species",
    {
      queryParams,
      schema: getV1SearchSpeciesResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
