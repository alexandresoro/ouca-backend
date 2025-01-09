import {
  getV1InventoriesIdResponse,
  getV1InventoriesResponse,
  putV1InventoriesIdResponse,
} from "@ou-ca/api/zod/inventory.zod";
import { useApiFetch } from "@services/api/useApiFetch";
import { useApiMutation } from "@services/api/useApiMutation";
import { type UseApiQueryCommonParams, type UseApiQuerySWROptions, useApiQuery } from "@services/api/useApiQuery";
import type { SWRMutationConfiguration } from "swr/dist/mutation";
import { z } from "zod";

export const useApiInventoryQuery = (
  id: string | null,
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1InventoriesIdResponse>>,
) => {
  return useApiQuery(
    id != null ? `/inventories/${id}` : null,
    {
      schema: getV1InventoriesIdResponse,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiInventoryIndex = (
  id: string | null,
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<number>,
) => {
  return useApiQuery(
    id ? `/inventories/${id}/index` : null,
    {
      queryParams,
      schema: z.number(),
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiInventoriesQuery = (
  queryParams: UseApiQueryCommonParams["queryParams"],
  swrOptions?: UseApiQuerySWROptions<z.infer<typeof getV1InventoriesResponse>>,
  { paused = false } = {},
) => {
  return useApiQuery(
    "/inventories",
    {
      queryParams,
      schema: getV1InventoriesResponse,
      paused,
    },
    {
      ...swrOptions,
    },
  );
};

export const useApiInventoryCreate = () => {
  return useApiFetch({
    path: "/inventories",
    method: "POST",
    schema: putV1InventoriesIdResponse,
  });
};

export const useApiInventoryUpdate = (
  id: string | null,
  swrOptions?: SWRMutationConfiguration<z.infer<typeof putV1InventoriesIdResponse>, unknown>,
) => {
  return useApiMutation(
    id ? `/inventories/${id}` : null,
    {
      method: "PUT",
      schema: putV1InventoriesIdResponse,
    },
    {
      revalidate: false,
      populateCache: true,
      ...swrOptions,
    },
  );
};

export const useApiInventoryDelete = (id: string | null, swrOptions?: SWRMutationConfiguration<unknown, unknown>) => {
  return useApiMutation(
    id ? `/inventories/${id}` : null,
    {
      method: "DELETE",
    },
    {
      revalidate: false,
      ...swrOptions,
    },
  );
};
