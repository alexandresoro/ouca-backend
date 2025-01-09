import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import {
  type Weather,
  type WeatherCreateInput,
  type WeatherFindManyInput,
  weatherSchema,
} from "@domain/weather/weather.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { countSchema } from "@infrastructure/repositories/common.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";

const findWeatherById = async (id: number): Promise<Weather | null> => {
  const weatherResult = await kysely
    .selectFrom("meteo")
    .select([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return weatherResult ? weatherSchema.parse(weatherResult) : null;
};

const findWeathersById = async (ids: string[]): Promise<Weather[]> => {
  const weathersResult = await kysely
    .selectFrom("meteo")
    .select([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .where(
      "meteo.id",
      "in",
      ids.map((id) => Number.parseInt(id)),
    )
    .execute();

  return z.array(weatherSchema).parse(weathersResult);
};

const findWeathers = async (
  { orderBy, sortOrder, q, offset, limit }: WeatherFindManyInput = {},
  ownerId?: string,
): Promise<Weather[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryWeather;

  if (isSortByNbDonnees) {
    queryWeather = kysely
      .selectFrom("meteo")
      .leftJoin("inventaire_meteo", "inventaire_meteo.meteoId", "meteo.id")
      .leftJoin("inventaire", "inventaire_meteo.inventaireId", "inventaire.id")
      .leftJoin("donnee", "inventaire.id", "donnee.inventaireId")
      .select([sql`basenaturaliste.meteo.id::text`.as("id"), "libelle", "meteo.ownerId"]);

    if (q?.length) {
      queryWeather = queryWeather.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    queryWeather = queryWeather
      .groupBy("meteo.id")
      .orderBy(
        (eb) =>
          ownerId ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId) : eb.fn.count("donnee.id"),
        sortOrder ?? undefined,
      )
      .orderBy("meteo.libelle asc");
  } else {
    queryWeather = kysely
      .selectFrom("meteo")
      .select([sql`basenaturaliste.meteo.id::text`.as("id"), "libelle", "meteo.ownerId"]);

    if (q?.length) {
      queryWeather = queryWeather.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    if (orderBy) {
      queryWeather = queryWeather.orderBy(orderBy, sortOrder ?? undefined);
    }
  }

  if (offset) {
    queryWeather = queryWeather.offset(offset);
  }
  if (limit) {
    queryWeather = queryWeather.limit(limit);
  }

  const weathersResult = await queryWeather.execute();

  return z.array(weatherSchema).parse(weathersResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("meteo").select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getEntriesCountById = async (id: string, ownerId?: string): Promise<number> => {
  let countResultQuery = kysely
    .selectFrom("donnee")
    .leftJoin("inventaire", "inventaire.id", "donnee.inventaireId")
    .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
    .select((eb) => eb.fn.count("donnee.id").distinct().as("count"))
    .where("inventaire_meteo.meteoId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createWeather = async (weatherInput: WeatherCreateInput): Promise<Result<Weather, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("meteo")
      .values({
        libelle: weatherInput.libelle,
        ownerId: weatherInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdWeather) => weatherSchema.parse(createdWeather));
};

const createWeathers = async (weatherInputs: WeatherCreateInput[]): Promise<Weather[]> => {
  const createdWeathers = await kysely
    .insertInto("meteo")
    .values(
      weatherInputs.map((weatherInput) => {
        return {
          libelle: weatherInput.libelle,
          ownerId: weatherInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .execute();

  return z.array(weatherSchema).nonempty().parse(createdWeathers);
};

const updateWeather = async (
  weatherId: number,
  weatherInput: WeatherCreateInput,
): Promise<Result<Weather, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("meteo")
      .set({
        libelle: weatherInput.libelle,
        ownerId: weatherInput.ownerId,
      })
      .where("id", "=", weatherId)
      .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedWeather) => weatherSchema.parse(updatedWeather));
};

const deleteWeatherById = async (weatherId: number): Promise<Weather | null> => {
  const deletedWeather = await kysely
    .deleteFrom("meteo")
    .where("id", "=", weatherId)
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .executeTakeFirst();

  return deletedWeather ? weatherSchema.parse(deletedWeather) : null;
};

export const weatherRepository = {
  findWeatherById,
  findWeathersById,
  findWeathers,
  getCount,
  getEntriesCountById,
  createWeather,
  createWeathers,
  updateWeather,
  deleteWeatherById,
};
