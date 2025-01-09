import {
  getV1DepartmentsIdInfoResponse,
  getV1DepartmentsIdResponse,
  getV1DepartmentsResponse,
  putV1DepartmentsIdResponse,
} from "@ou-ca/api/zod/location.zod";
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

export const useApiDepartmentQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1DepartmentsIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/departments/${id}` : null,
    {
      schema: getV1DepartmentsIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDepartmentInfoQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1DepartmentsIdInfoResponse>>,
) => {
  return useApiQuery(
    id != null ? `/departments/${id}/info` : null,
    {
      schema: getV1DepartmentsIdInfoResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDepartmentsQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1DepartmentsResponse>>,
) => {
  return useApiQuery(
    "/departments",
    {
      queryParams,
      schema: getV1DepartmentsResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiDepartmentsInfiniteQuery = (
  queryParams: UseApiInfiniteQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWRInfiniteOptions<typeof getV1DepartmentsIdResponse>,
) => {
  return useApiInfiniteQuery(
    "/departments",
    {
      queryParams,
      schema: getV1DepartmentsResponse,
    },
    {
      revalidateFirstPage: false,
      ...swrOptions,
    },
  );
};

export const useApiDepartmentCreate = () => {
  return useApiFetch({
    path: "/departments",
    method: "POST",
    schema: putV1DepartmentsIdResponse,
  });
};

export const useApiDepartmentUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1DepartmentsIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/departments/${id}` : null,
    {
      method: "PUT",
      schema: putV1DepartmentsIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiDepartmentDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/departments/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
