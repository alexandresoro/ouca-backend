import { z } from "zod";
import { logger } from "../../utils/logger.js";

const zodStringToBoolean = (input: string | undefined): boolean => {
  return input?.toLowerCase() === "true" || input === "1";
};

const envDbSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <explanation>
  DATABASE_URL: z.string().default("postgresql://basenaturaliste:basenaturaliste@127.0.0.1:5432/basenaturaliste"),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_DATABASE_RUN_MIGRATIONS: z.string().default("false").transform(zodStringToBoolean),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_DATABASE_MIGRATION_SCHEMA: z.string().default("public"),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_DATABASE_MIGRATION_TABLE: z.string().default("base_naturaliste_umzug_migrations"),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OUCA_DATABASE_MIGRATIONS_PATH: z.string().default(new URL("../../../migrations/", import.meta.url).pathname),
});

export const getDbConfig = () => {
  const envDbParseResult = envDbSchema.safeParse(process.env);
  if (!envDbParseResult.success) {
    logger.fatal({ error: envDbParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envDbParseResult.data;
  return {
    url: env.DATABASE_URL,
    migrator: {
      runMigrations: env.OUCA_DATABASE_RUN_MIGRATIONS,
      migrationTableSchema: env.OUCA_DATABASE_MIGRATION_SCHEMA,
      migrationTableName: env.OUCA_DATABASE_MIGRATION_TABLE,
      migrationsPath: env.OUCA_DATABASE_MIGRATIONS_PATH,
    },
  };
};

export type DbConfig = ReturnType<typeof getDbConfig>;

export const dbConfig = getDbConfig();
