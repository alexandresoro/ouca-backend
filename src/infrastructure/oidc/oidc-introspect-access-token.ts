import type { OIDCIntrospectionResult } from "@domain/oidc/oidc-introspection.js";
import { oidcConfig } from "@infrastructure/config/oidc-config.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { parseZitadelIntrospectionResult } from "@infrastructure/oidc/zitadel/oidc-zitadel.js";
import { type Result, err, fromPromise, fromThrowable, ok } from "neverthrow";
import { logger } from "../../utils/logger.js";

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX = "accessTokenIntrospection";

const ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION = 3600; // 1h

const fetchIntrospectAccessToken = async (
  accessToken: string,
): Promise<Result<unknown, "fetchError" | "parseError">> => {
  const basicAuthHeader = Buffer.from(`${oidcConfig.clientId}:${oidcConfig.clientSecret}`).toString("base64");

  const responseResult = await fromPromise(
    fetch(`${oidcConfig.issuer}${oidcConfig.introspectionPath}`, {
      method: "POST",
      headers: {
        // biome-ignore lint/style/useNamingConvention: <explanation>
        Authorization: `Basic ${basicAuthHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: accessToken,
      }),
    }),
    (error) => {
      logger.error({ error }, "An error has occurred while trying to fetch the introspection endpoint");
      return "fetchError" as const;
    },
  );

  if (responseResult.isErr()) {
    return err(responseResult.error);
  }

  const response = responseResult.value;

  const responseBodyResult = await fromPromise(response.json(), (error) => {
    logger.error({ error }, "An error has occurred while trying to parse the introspection result");
    return "parseError" as const;
  });

  if (responseBodyResult.isErr()) {
    return err(responseBodyResult.error);
  }

  const responseBody = responseBodyResult.value;

  logger.trace(
    {
      status: response.status,
      jsonBody: responseBody,
      ok: response.ok,
    },
    "Token instrospection response",
  );

  return ok(responseBody);
};

/**
 * Calls the OIDC introspection endpoint and returns the response body of the introspection result
 */
export const introspectAccessToken = async (
  accessToken: string,
): Promise<
  Result<OIDCIntrospectionResult, "fetchIntrospectionError" | "providerConfigurationError" | "zodSchemaParseError">
> => {
  const introspectionResult = await fetchIntrospectAccessToken(accessToken);

  if (introspectionResult.isErr()) {
    return err("fetchIntrospectionError");
  }

  const introspectionToken = introspectionResult.value;

  switch (oidcConfig.provider) {
    case "zitadel": {
      return parseZitadelIntrospectionResult(introspectionToken);
    }
    default: {
      return err("providerConfigurationError");
    }
  }
};

export const getIntrospectionResultFromCache = async (
  accessToken: string,
): Promise<Result<OIDCIntrospectionResult | null, "parseError">> => {
  const key = `${ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX}:${accessToken}`;

  const cachedKeyStr = await redis.get(key);

  if (!cachedKeyStr) {
    return ok(null);
  }

  const parsedCachedKey = fromThrowable(
    (cachedKey: string) => JSON.parse(cachedKey) as OIDCIntrospectionResult,
    () => "parseError" as const,
  );

  return parsedCachedKey(cachedKeyStr);
};

export const storeIntrospectionResultInCache = async (
  introspectionResult: OIDCIntrospectionResult,
  accessToken: string,
) => {
  const key = `${ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_PREFIX}:${accessToken}`;

  await redis.set(key, JSON.stringify(introspectionResult)).catch(() => {
    logger.warn(
      {
        accessToken,
      },
      "Storing token introspection result has failed.",
    );
    return;
  });

  // Compute the TTL, it has to be the earliest between the cache duration and the expiration time, if active
  if (introspectionResult.active) {
    const tokenExpirationDate = new Date(introspectionResult.user.exp * 1000); // Token is in seconds

    const cacheExpirationDate = new Date();
    cacheExpirationDate.setSeconds(cacheExpirationDate.getSeconds() + ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);

    if (cacheExpirationDate <= tokenExpirationDate) {
      // Default cache duration is earlier than token duration
      await redis.expire(key, ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);
    } else {
      // Token expires before the default duration
      await redis.expireat(key, introspectionResult.user.exp);
    }
  } else {
    // If token is not active, set the default duration
    await redis.expire(key, ACCESS_TOKEN_INTROSPECTION_RESULT_CACHE_DURATION);
  }
};
