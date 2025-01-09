import type { AltitudeResult, ProviderFailureReason } from "@domain/altitude/altitude.js";
import { fetchAltitudeFromIGNAlticodage } from "@infrastructure/altitude/providers/ign-alticodage.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { type Result, fromThrowable, ok } from "neverthrow";
import { logger } from "../../utils/logger.js";

const ALTITUDE_RESULT_CACHE_PREFIX = "altitudeResult";

const ALTITUDE_RESULT_CACHE_DURATION = 86_400; // 1d

const fetchAltitude = async ({
  latitude,
  longitude,
}: { latitude: number; longitude: number }): Promise<Result<AltitudeResult, ProviderFailureReason>> => {
  // For now we only haved IGN as a provider
  const altitudeFromIgnResult = await fetchAltitudeFromIGNAlticodage({ latitude, longitude });

  return altitudeFromIgnResult;
};

const getAltitudeResultFromCache = async ({
  latitude,
  longitude,
}: { latitude: number; longitude: number }): Promise<Result<AltitudeResult | null, "parseError">> => {
  const key = `${ALTITUDE_RESULT_CACHE_PREFIX}:${latitude}:${longitude}`;

  const cachedKeyStr = await redis.get(key);

  if (!cachedKeyStr) {
    return ok(null);
  }

  const parsedCachedKey = fromThrowable(
    (cachedKey: string) => JSON.parse(cachedKey) as AltitudeResult,
    () => "parseError" as const,
  );

  return parsedCachedKey(cachedKeyStr);
};

const storeAltitudeResultInCache = async (altitudeResult: AltitudeResult) => {
  const key = `${ALTITUDE_RESULT_CACHE_PREFIX}:${altitudeResult.coordinates.latitude}:${altitudeResult.coordinates.longitude}`;

  await redis.set(key, JSON.stringify(altitudeResult), "EX", ALTITUDE_RESULT_CACHE_DURATION).catch(() => {
    logger.warn(
      {
        altitudeResult,
      },
      "Storing token introspection result has failed.",
    );
    return;
  });
};

const getAltitude = async ({
  latitude,
  longitude,
}: { latitude: number; longitude: number }): Promise<Result<AltitudeResult, ProviderFailureReason>> => {
  const altitudeResultFromCache = await getAltitudeResultFromCache({ latitude, longitude });
  if (altitudeResultFromCache.isOk() && altitudeResultFromCache.value !== null) {
    return ok(altitudeResultFromCache.value);
  }

  const altitudeResult = await fetchAltitude({ latitude, longitude });

  if (altitudeResult.isErr()) {
    return altitudeResult;
  }

  await storeAltitudeResultInCache(altitudeResult.value);

  return altitudeResult;
};

export const altitudeFetcher = {
  getAltitude,
};
