import { useApiUrl } from "@services/api/useApiUrl";
import { fetchApi } from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useAuth } from "react-oidc-context";
import useSWRInfinite, { type SWRInfiniteConfiguration } from "swr/infinite";
import type { z } from "zod";
import type { PaginatedResponseSchemaType } from "./pagination";

export type UseApiInfiniteQueryCommonParams = {
  queryParams: Record<string, string | number | string[] | number[] | boolean | undefined> & {
    pageSize: number;
  };
};

type UseApiInfiniteQueryParams<T extends z.ZodTypeAny> = UseApiInfiniteQueryCommonParams & {
  schema?: PaginatedResponseSchemaType<T>;
};

export type UseApiQuerySWRInfiniteOptions<T extends z.ZodTypeAny, E = unknown> = Omit<
  SWRInfiniteConfiguration<z.infer<PaginatedResponseSchemaType<T>>, E>,
  "fetcher"
>;

export const useApiInfiniteQuery = <T extends z.ZodTypeAny, E = unknown>(
  path: string | null,
  { queryParams, schema }: UseApiInfiniteQueryParams<T>,
  swrOptions?: UseApiQuerySWRInfiniteOptions<T, E>,
) => {
  const { user } = useAuth();
  const apiUrl = useApiUrl();

  const accessToken = user?.access_token;

  const getKey = (pageIndex: number, previousPageData: z.infer<PaginatedResponseSchemaType<T>> | null) => {
    if (path == null) {
      // Disable query if path is null
      return null;
    }

    if (previousPageData != null && previousPageData.meta.count <= pageIndex * queryParams.pageSize) {
      return null;
    }

    const queryString = toUrlSearchParams({ ...queryParams, pageNumber: pageIndex + 1 }).toString();

    const queryUrl = `${apiUrl}${path}?${queryString}`;

    return { url: queryUrl, token: accessToken };
  };

  const infiniteResponse = useSWRInfinite(getKey, ({ url, token }) => fetchApi({ url, token, schema }), swrOptions);
  const { setSize, data } = infiniteResponse;

  const fetchNextPage = async () => {
    await setSize((size) => size + 1);
  };

  const hasNextPage =
    path != null &&
    data != null &&
    data.length > 0 &&
    data[data.length - 1].meta.count > data.length * queryParams.pageSize;

  return {
    ...infiniteResponse,
    fetchNextPage,
    hasNextPage,
  };
};
