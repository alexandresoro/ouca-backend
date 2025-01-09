import { pino } from "pino";
import { z } from "zod";

// Don't rely on app-wide logger as it needs this config to be built
const initLogger = pino({
  level: "warn",
  base: undefined,
});

const envLogSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("warn"),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_LOG_PRETTY: z.coerce.boolean().default(false),
});

const getLoggerConfig = () => {
  const envLoggerParseResult = envLogSchema.safeParse(process.env);
  if (!envLoggerParseResult.success) {
    initLogger.fatal(
      { error: envLoggerParseResult.error },
      "An error has occurred when trying to parse the environment",
    );
    process.exit(1);
  }
  const env = envLoggerParseResult.data;

  return {
    level: env.OUCA_LOG_LEVEL,
    pretty: env.OUCA_LOG_PRETTY,
  };
};

export const loggerConfig = getLoggerConfig();
