import fs from "node:fs";
import path from "node:path";
import { dbConfig } from "@infrastructure/config/database-config.js";
import { type Database, kysely as defaultKysely } from "@infrastructure/kysely/kysely.js";
import { type Generated, type Kysely, sql } from "kysely";
import { Umzug } from "umzug";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

export const getUmzugInstance = (kyselyCustomInstance?: Kysely<Database>) => {
  // The cast here is a bit ugly but avoids to pollute the main Database object
  const kysely = (kyselyCustomInstance ?? defaultKysely) as unknown as Kysely<{
    migrationTable: {
      name: string;
      date: Generated<Date>;
    };
  }>;

  return new Umzug({
    migrations: {
      glob: `${dbConfig.migrator.migrationsPath}/*.sql`,
      resolve: ({ name, path: pathFile }) => {
        return {
          name,
          up: async () => {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const sqlToRun = fs.readFileSync(pathFile!).toString();
            await sql.raw(sqlToRun).execute(kysely);
          },
          down: async () => {
            // Get the corresponding `down file` file to undo this migration
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const downPath = path.join(path.dirname(pathFile!), "down", path.basename(pathFile!));
            const sqlToRun = fs.readFileSync(downPath).toString();
            await sql.raw(sqlToRun).execute(kysely);
          },
        };
      },
    },
    storage: {
      async executed() {
        await sql`CREATE TABLE IF NOT EXISTS ${sql.ref(
          `${dbConfig.migrator.migrationTableSchema}.${dbConfig.migrator.migrationTableName}`,
        )} (name text, date timestamptz not null default now())`.execute(kysely);

        const rawNames = await kysely
          .selectFrom(
            `${dbConfig.migrator.migrationTableSchema}.${dbConfig.migrator.migrationTableName}` as "migrationTable",
          )
          .select("name")
          .execute();

        const names = z
          .array(
            z.object({
              name: z.string(),
            }),
          )
          .parse(rawNames)
          .map(({ name }) => name);
        return names;
      },
      async logMigration({ name }) {
        await kysely
          .insertInto(
            `${dbConfig.migrator.migrationTableSchema}.${dbConfig.migrator.migrationTableName}` as "migrationTable",
          )
          .values({
            name,
          })
          .execute();
      },
      async unlogMigration({ name }) {
        await kysely
          .deleteFrom(
            `${dbConfig.migrator.migrationTableSchema}.${dbConfig.migrator.migrationTableName}` as "migrationTable",
          )
          .where("name", "=", name)
          .execute();
      },
    },
    logger: logger.child({ module: "umzug" }),
    create: {
      folder: dbConfig.migrator.migrationsPath,
    },
  });
};

export const runMigrations = async () => {
  if (dbConfig.migrator.runMigrations) {
    logger.child({ module: "umzug" }).debug("Running database migrations");
    const umzug = getUmzugInstance();
    await umzug.up();
  } else {
    logger.debug("No migrations to run as feature is disabled");
  }
};
