import { z } from "zod";
import { logger } from "../../utils/logger.js";

const envRedisSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <explanation>
  REDIS_URL: z.string().default("redis://localhost:6379/0"),
});

export const getRedisConfig = () => {
  const envRedisParseResult = envRedisSchema.safeParse(process.env);
  if (!envRedisParseResult.success) {
    logger.fatal({ error: envRedisParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envRedisParseResult.data;
  return {
    url: env.REDIS_URL,
  };
};

export const redisConfig = getRedisConfig();
