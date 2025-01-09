import { redis } from "@infrastructure/ioredis/redis.js";
import { logger } from "../../../utils/logger.js";

const GEOJSON_DATA_REDIS_KEY = "geoJsonLocalities";

const getLocalities = async (): Promise<Buffer | null> => {
  const cachedLocalitiesStr = await redis.getBuffer(GEOJSON_DATA_REDIS_KEY);

  return cachedLocalitiesStr ?? null;
};

const saveLocalities = async (localitiesCollection: unknown): Promise<void> => {
  logger.debug("Storing localities feature collection to cache");
  await redis.set(GEOJSON_DATA_REDIS_KEY, JSON.stringify(localitiesCollection));
};

export const localityGeojsonRepository = {
  getLocalities,
  saveLocalities,
};
