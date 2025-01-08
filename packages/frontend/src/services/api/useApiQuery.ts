import { fetchApi } from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useAuth } from "react-oidc-context";
import useSWR, { type SWRConfiguration } from "swr";
import type { z } from "zod";
import { useApiUrl } from "./useApiUrl";

export type ApiQueryKey = {
  url: string;
  token: string | undefined;
} | null;

export type UseApiQueryCommonParams = {
  queryParams?: Record<string, string | number | string[] | number[] | boolean | undefined>;
  paused?: boolean;
  useApiPath?: boolean;
};

type UseApiQueryParams<T = unknown> = UseApiQueryCommonParams & {
  schema?: z.ZodType<T>;
};

export type UseApiQuerySWROptions<T = unknown, E = unknown> = Omit<SWRConfiguration<T, E>, "fetcher">;

export const useApiQuery = <T = unknown, E = unknown>(
  path: string | null,
  { queryParams, paused, schema }: UseApiQueryParams<T> = {},
  swrOptions?: UseApiQuerySWROptions<T, E>,
) => {
  const { user } = useAuth();
  const apiUrl = useApiUrl();

  const accessToken = user?.access_token;

  const queryString = toUrlSearchParams(queryParams).toString();

  const queryUrl = path != null ? `${apiUrl}${path}${queryString.length ? `?${queryString}` : ""}` : null;

  return useSWR<T, E, ApiQueryKey>(
    !paused && queryUrl != null ? { url: queryUrl, token: accessToken } : null,
    ({ url, token }) => fetchApi({ url, token, schema }),
    swrOptions,
  );
};
