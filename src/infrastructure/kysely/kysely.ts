import { dbConfig } from "@infrastructure/config/database-config.js";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { serializeError } from "serialize-error";
import { logger } from "../../utils/logger.js";
import type { Age } from "./database/Age.js";
import type { Behavior } from "./database/Behavior.js";
import type { Department } from "./database/Department.js";
import type { DistanceEstimate } from "./database/DistanceEstimate.js";
import type { Entry } from "./database/Entry.js";
import type { EntryBehavior } from "./database/EntryBehavior.js";
import type { EntryEnvironment } from "./database/EntryEnvironment.js";
import type { Environment } from "./database/Environment.js";
import type { Inventory } from "./database/Inventory.js";
import type { InventoryAssociate } from "./database/InventoryAssociate.js";
import type { InventoryWeather } from "./database/InventoryWeather.js";
import type { Locality } from "./database/Locality.js";
import type { NumberEstimate } from "./database/NumberEstimate.js";
import type { Observer } from "./database/Observer.js";
import type { Sex } from "./database/Sex.js";
import type { Species } from "./database/Species.js";
import type { SpeciesClass } from "./database/SpeciesClass.js";
import type { Town } from "./database/Town.js";
import type { User } from "./database/User.js";
import type { Weather } from "./database/Weather.js";

export type Database = {
  age: Age;
  classe: SpeciesClass;
  commune: Town;
  comportement: Behavior;
  departement: Department;
  donnee: Entry;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  donnee_comportement: EntryBehavior;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  donnee_milieu: EntryEnvironment;
  espece: Species;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  estimation_distance: DistanceEstimate;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  estimation_nombre: NumberEstimate;
  inventaire: Inventory;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  inventaire_associe: InventoryAssociate;
  // biome-ignore lint/style/useNamingConvention: <explanation>
  inventaire_meteo: InventoryWeather;
  lieudit: Locality;
  meteo: Weather;
  milieu: Environment;
  observateur: Observer;
  sexe: Sex;
  user: User;
};

const kyselyLogger = logger.child({ module: "kysely" });

// https://github.com/brianc/node-postgres/issues/811
// Parse NUMERIC as number, not string as we assume that they fit into JS number
pg.types.setTypeParser(pg.types.builtins.NUMERIC, "text", Number.parseFloat);

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: dbConfig.url,
  }),
});

export const getKyselyInstance = () => {
  return new Kysely<Database>({
    dialect,
    plugins: [new CamelCasePlugin()],
    log: (event) => {
      switch (event.level) {
        case "query":
          kyselyLogger.trace(
            {
              executionTime: event.queryDurationMillis,
              query: event.query.sql,
            },
            "query",
          );
          break;
        case "error":
          kyselyLogger.warn(
            {
              error: serializeError(event.error),
              query: event.query.sql,
            },
            "query execution produced an error",
          );
          break;
        default:
          break;
      }
    },
  });
};

export const kysely = getKyselyInstance().withSchema("basenaturaliste");
