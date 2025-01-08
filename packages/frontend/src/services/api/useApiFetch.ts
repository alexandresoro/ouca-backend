import { fetchApi } from "@utils/fetch-api";
import { toUrlSearchParams } from "@utils/url/url-search-params";
import { useCallback } from "react";
import { useAuth } from "react-oidc-context";
import type { z } from "zod";
import { useApiUrl } from "./useApiUrl";

type UseApiFetchParams<T> = { path?: string; method?: string; schema?: z.ZodType<T> };

type UseApiFetchCallParams = {
  path?: string;
  body?: Record<string, unknown> | FormData;
  queryParams?: Record<string, string | number | boolean | undefined>;
};

export function useApiFetch<T>({
  path,
  method,
  schema,
}: { path: string; method?: string; schema?: z.ZodType<T> }): (
  options?: Omit<UseApiFetchCallParams, "path">,
) => Promise<T>;
export function useApiFetch<T>({ method, schema }: Omit<UseApiFetchParams<T>, "path">): ({
  path,
  body,
  queryParams,
}: {
  path: string;
  body?: Record<string, unknown>;
  queryParams?: Record<string, string | number | boolean | undefined>;
}) => Promise<T>;
export function useApiFetch<T>({
  path: pathFromSignature,
  method,
  schema,
}: UseApiFetchParams<T>): (params?: UseApiFetchCallParams) => Promise<T> {
  const { user } = useAuth();
  const apiUrl = useApiUrl();

  const accessToken = user?.access_token;

  return useCallback(
    async (params?: UseApiFetchCallParams) => {
      const { path: pathFromCall, body, queryParams } = params ?? {};

      const queryString = toUrlSearchParams(queryParams).toString();

      const path = pathFromSignature ?? pathFromCall;
      if (!path) {
        throw new Error("Missing path in query");
      }

      return fetchApi({
        url: `${apiUrl}${path}${queryString.length ? `?${queryString}` : ""}`,
        method,
        body,
        token: accessToken,
        schema,
      });
    },
    [apiUrl, accessToken, pathFromSignature, method, schema],
  );
}
