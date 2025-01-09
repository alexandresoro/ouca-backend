import {
  getV1WeathersIdInfoResponse,
  getV1WeathersIdResponse,
  getV1WeathersResponse,
  putV1WeathersIdResponse,
} from "@ou-ca/api/zod/weather.zod";
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

export const useApiWeatherQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1WeathersIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/weathers/${id}` : null,
    {
      schema: getV1WeathersIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiWeatherInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1WeathersIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/weathers/${id}/info` : null,
    {
      schema: getV1WeathersIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiWeathersQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1WeathersResponse>>,
) => {
  return useApiQuery(
    "/weathers",
    {
      queryParams,
      schema: getV1WeathersResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiWeathersInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1WeathersIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/weathers",
    {
      queryParams,
      schema: getV1WeathersResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiWeatherCreate = () => {
  return useApiFetch({
    path: "/weathers",
    method: "POST",
    schema: putV1WeathersIdResponse,
  });
};

export const useApiWeatherUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1WeathersIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/weathers/${id}` : null,
    {
      method: "PUT",
      schema: putV1WeathersIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiWeatherDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/weathers/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
