import { redisConfig } from "@infrastructure/config/redis-config.js";
import { Redis } from "ioredis";

export const redis = new Redis(redisConfig.url, {
  // https://github.com/OptimalBits/bull/commit/3ade8e6727d7b906a30b09bccb6dc10d76ed1b5f
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
