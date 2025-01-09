import { z } from "zod";
import { logger } from "../../utils/logger.js";

const envServerSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_SERVER_HOST: z.string().default("localhost"),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_SERVER_PORT: z.coerce.number().min(1).max(65535).multipleOf(1).default(4000),
});

export const getServerConfig = () => {
  const envServerParseResult = envServerSchema.safeParse(process.env);
  if (!envServerParseResult.success) {
    logger.fatal({ error: envServerParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envServerParseResult.data;

  return {
    host: env.OUCA_SERVER_HOST,
    port: env.OUCA_SERVER_PORT,
  };
};

export const serverConfig = getServerConfig();
