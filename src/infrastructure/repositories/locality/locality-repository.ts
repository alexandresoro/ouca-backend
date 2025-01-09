import { type GeoJSONLocality, geoJSONLocalitySchema } from "@domain/locality/locality-geojson.js";
import {
  type Locality,
  type LocalityCreateInput,
  type LocalityFindManyInput,
  localitySchema,
} from "@domain/locality/locality.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import {
  reshapeRawLocality,
  reshapeRawLocalityForGeoJson,
  reshapeRawLocalityWithTownAndDepartment,
} from "@infrastructure/repositories/locality/locality-repository-reshape.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findLocalityById = async (id: number): Promise<Locality | null> => {
  const localityResult = await kysely
    .selectFrom("lieudit")
    .select([
      sql<string>`id::text`.as("id"),
      "nom",
      "altitude",
      "longitude",
      "latitude",
      sql<string>`commune_id::text`.as("communeId"),
      "ownerId",
    ])
    .where("id", "=", id)
    .executeTakeFirst();

  return localityResult ? localitySchema.parse(reshapeRawLocality(localityResult)) : null;
};

const findLocalityByInventoryId = async (inventoryId: string | undefined): Promise<Locality | null> => {
  if (!inventoryId) {
    return null;
  }

  const localityResult = await kysely
    .selectFrom("lieudit")
    .leftJoin("inventaire", "lieudit.id", "inventaire.lieuditId")
    .select([
      sql<string>`lieudit.id::text`.as("id"),
      "lieudit.nom",
      "lieudit.altitude",
      "lieudit.longitude",
      "lieudit.latitude",
      sql<string>`lieudit.commune_id::text`.as("communeId"),
      "lieudit.ownerId",
    ])
    .where("inventaire.id", "=", inventoryId)
    .executeTakeFirst();

  return localityResult ? localitySchema.parse(reshapeRawLocality(localityResult)) : null;
};

const findLocalities = async (
  { orderBy, sortOrder, q, townId, offset, limit }: LocalityFindManyInput = {},
  ownerId?: string,
): Promise<Locality[]> => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryLocality;

  switch (orderBy) {
    case "nbDonnees":
      queryLocality = kysely
        .selectFrom("lieudit")
        .leftJoin("inventaire", "lieudit.id", "inventaire.lieuditId")
        .leftJoin("donnee", "inventaire.id", "donnee.inventaireId")
        .select([
          sql<string>`lieudit.id::text`.as("id"),
          "lieudit.nom",
          "lieudit.altitude",
          "lieudit.longitude",
          "lieudit.latitude",
          sql<string>`lieudit.commune_id::text`.as("communeId"),
          "lieudit.ownerId",
        ]);

      if (q?.length) {
        queryLocality = queryLocality.where(sql`unaccent(lieudit.nom)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      if (townId != null) {
        queryLocality = queryLocality.where("lieudit.communeId", "=", Number.parseInt(townId));
      }

      queryLocality = queryLocality
        .groupBy("lieudit.id")
        .orderBy(
          (eb) =>
            ownerId
              ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId)
              : eb.fn.count("donnee.id"),
          sortOrder ?? undefined,
        )
        .orderBy("lieudit.nom asc");

      break;
    case "departement":
      queryLocality = kysely
        .selectFrom("lieudit")
        .leftJoin("commune", "lieudit.communeId", "commune.id")
        .leftJoin("departement", "commune.departementId", "departement.id")
        .select([
          sql<string>`lieudit.id::text`.as("id"),
          "lieudit.nom",
          "lieudit.altitude",
          "lieudit.longitude",
          "lieudit.latitude",
          sql<string>`lieudit.commune_id::text`.as("communeId"),
          "lieudit.ownerId",
        ]);

      if (q?.length) {
        queryLocality = queryLocality.where(sql`unaccent(lieudit.nom)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      if (townId != null) {
        queryLocality = queryLocality.where("lieudit.communeId", "=", Number.parseInt(townId));
      }

      queryLocality = queryLocality.orderBy("departement.code", sortOrder ?? undefined).orderBy("lieudit.nom asc");

      break;
    case "codeCommune":
    case "nomCommune":
      queryLocality = kysely
        .selectFrom("lieudit")
        .leftJoin("commune", "lieudit.communeId", "commune.id")
        .select([
          sql<string>`lieudit.id::text`.as("id"),
          "lieudit.nom",
          "lieudit.altitude",
          "lieudit.longitude",
          "lieudit.latitude",
          sql<string>`lieudit.commune_id::text`.as("communeId"),
          "lieudit.ownerId",
        ]);

      if (q?.length) {
        queryLocality = queryLocality.where(sql`unaccent(lieudit.nom)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      if (townId != null) {
        queryLocality = queryLocality.where("lieudit.communeId", "=", Number.parseInt(townId));
      }

      queryLocality = queryLocality
        .orderBy(orderBy === "codeCommune" ? "commune.code" : "commune.nom", sortOrder ?? undefined)
        .orderBy("lieudit.nom asc");

      break;
    default:
      queryLocality = kysely
        .selectFrom("lieudit")
        .select([
          sql<string>`lieudit.id::text`.as("id"),
          "lieudit.nom",
          "lieudit.altitude",
          "lieudit.longitude",
          "lieudit.latitude",
          sql<string>`lieudit.commune_id::text`.as("communeId"),
          "lieudit.ownerId",
        ]);

      if (q?.length) {
        queryLocality = queryLocality.where(sql`unaccent(lieudit.nom)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      if (townId != null) {
        queryLocality = queryLocality.where("lieudit.communeId", "=", Number.parseInt(townId));
      }

      if (orderBy) {
        queryLocality = queryLocality.orderBy(orderBy, sortOrder ?? undefined).orderBy("lieudit.id asc");
      } else {
        // If no explicit order is requested and a query is provided, return the matches in the following order:
        // The ones for which nom starts with query
        // Then the ones which nom contains the query

        if (q?.length) {
          queryLocality = queryLocality.orderBy(sql`lieudit.nom ilike ${`${q}%`}`, "desc");
        }

        // Then two groups are finally sorted alphabetically in any case
        queryLocality = queryLocality.orderBy("lieudit.nom asc");
      }

      break;
  }

  if (offset) {
    queryLocality = queryLocality.offset(offset);
  }
  if (limit) {
    queryLocality = queryLocality.limit(limit);
  }

  const localitiesResult = await queryLocality.execute();

  return z.array(localitySchema).parse(localitiesResult.map((locality) => reshapeRawLocality(locality)));
};

const getCount = async (q?: string | null, townId?: string | null, departmentId?: string | null): Promise<number> => {
  let query = kysely
    .selectFrom("lieudit")
    .leftJoin("commune", "lieudit.communeId", "commune.id")
    .select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where(sql`unaccent(lieudit.nom)`, "ilike", sql`unaccent(${`%${q}%`})`);
  }

  if (townId != null) {
    query = query.where("lieudit.communeId", "=", Number.parseInt(townId));
  }

  if (departmentId != null) {
    query = query.where("commune.departementId", "=", Number.parseInt(departmentId));
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getEntriesCountById = async (id: string, ownerId?: string): Promise<number> => {
  let countResultQuery = kysely
    .selectFrom("donnee")
    .leftJoin("inventaire", "inventaire.id", "donnee.inventaireId")
    .select((eb) => eb.fn.count("donnee.id").distinct().as("count"))
    .where("inventaire.lieuditId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const findAllLocalitiesWithTownAndDepartmentCode = async (): Promise<
  (Locality & {
    townCode: number;
    townName: string;
    departmentCode: string;
  })[]
> => {
  const localitiesWithTownAndDepartmentCode = await kysely
    .selectFrom("lieudit")
    .leftJoin("commune", "lieudit.communeId", "commune.id")
    .leftJoin("departement", "commune.departementId", "departement.id")
    .select([
      sql<string>`lieudit.id::text`.as("id"),
      "lieudit.nom",
      "lieudit.altitude",
      "lieudit.longitude",
      "lieudit.latitude",
      sql<string>`lieudit.commune_id::text`.as("communeId"),
      "lieudit.ownerId",
      "commune.code as townCode",
      "commune.nom as townName",
      "departement.code as departmentCode",
    ])
    .execute();

  return z
    .array(localitySchema.extend({ townCode: z.number(), townName: z.string(), departmentCode: z.string() }))
    .parse(
      localitiesWithTownAndDepartmentCode.map((localityWithTownAndDepartmentCode) =>
        reshapeRawLocalityWithTownAndDepartment(localityWithTownAndDepartmentCode),
      ),
    );
};

const createLocality = async (localityInput: LocalityCreateInput): Promise<Result<Locality, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("lieudit")
      .values({
        nom: localityInput.nom,
        altitude: localityInput.altitude,
        longitude: localityInput.longitude,
        latitude: localityInput.latitude,
        communeId: Number.parseInt(localityInput.townId),
        ownerId: localityInput.ownerId,
        coordinatesSystem: "gps",
      })
      .returning([
        sql<string>`id::text`.as("id"),
        "nom",
        "altitude",
        "longitude",
        "latitude",
        sql<string>`commune_id::text`.as("communeId"),
        "ownerId",
      ])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdLocality) => localitySchema.parse(reshapeRawLocality(createdLocality)));
};

const createLocalities = async (localityInputs: LocalityCreateInput[]): Promise<Locality[]> => {
  const createdLocalities = await kysely
    .insertInto("lieudit")
    .values(
      localityInputs.map((localityInput) => ({
        nom: localityInput.nom,
        altitude: localityInput.altitude,
        longitude: localityInput.longitude,
        latitude: localityInput.latitude,
        communeId: Number.parseInt(localityInput.townId),
        ownerId: localityInput.ownerId,
        coordinatesSystem: "gps",
      })),
    )
    .returning([
      sql<string>`id::text`.as("id"),
      "nom",
      "altitude",
      "longitude",
      "latitude",
      sql<string>`commune_id::text`.as("communeId"),
      "ownerId",
    ])
    .execute();

  return z
    .array(localitySchema)
    .nonempty()
    .parse(createdLocalities.map((createdLocality) => reshapeRawLocality(createdLocality)));
};

const updateLocality = async (
  localityId: number,
  localityInput: LocalityCreateInput,
): Promise<Result<Locality, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("lieudit")
      .set({
        nom: localityInput.nom,
        altitude: localityInput.altitude,
        longitude: localityInput.longitude,
        latitude: localityInput.latitude,
        communeId: Number.parseInt(localityInput.townId),
        ownerId: localityInput.ownerId,
      })
      .where("id", "=", localityId)
      .returning([
        sql<string>`id::text`.as("id"),
        "nom",
        "altitude",
        "longitude",
        "latitude",
        sql<string>`commune_id::text`.as("communeId"),
        "ownerId",
      ])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedLocality) => localitySchema.parse(reshapeRawLocality(updatedLocality)));
};

const deleteLocalityById = async (localityId: number): Promise<Locality | null> => {
  const deletedLocality = await kysely
    .deleteFrom("lieudit")
    .where("id", "=", localityId)
    .returning([
      sql<string>`id::text`.as("id"),
      "nom",
      "altitude",
      "longitude",
      "latitude",
      sql<string>`commune_id::text`.as("communeId"),
      "ownerId",
    ])
    .executeTakeFirst();

  return deletedLocality ? localitySchema.parse(reshapeRawLocality(deletedLocality)) : null;
};

const getLocalitiesForGeoJSON = async (): Promise<GeoJSONLocality[]> => {
  const localitiesForGeoJson = await kysely
    .selectFrom("lieudit")
    .leftJoin("commune", "lieudit.communeId", "commune.id")
    .leftJoin("departement", "commune.departementId", "departement.id")
    .select([
      sql<string>`lieudit.id::text`.as("id"),
      "lieudit.nom",
      "lieudit.altitude",
      "lieudit.longitude",
      "lieudit.latitude",
      sql<string>`lieudit.commune_id::text`.as("communeId"),
      "commune.nom as townName",
      sql<string>`commune.departement_id::text`.as("departmentId"),
      "departement.code as departmentCode",
      "lieudit.ownerId",
    ])
    .execute();

  return z
    .array(geoJSONLocalitySchema)
    .parse(localitiesForGeoJson.map((localityForGeoJson) => reshapeRawLocalityForGeoJson(localityForGeoJson)));
};

export const localityRepository = {
  findLocalityById,
  findLocalityByInventoryId,
  findLocalities,
  getCount,
  getEntriesCountById,
  findAllLocalitiesWithTownAndDepartmentCode,
  createLocality,
  createLocalities,
  updateLocality,
  deleteLocalityById,
  getLocalitiesForGeoJSON,
};
