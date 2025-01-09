import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { type Town, type TownCreateInput, type TownFindManyInput, townSchema } from "@domain/town/town.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";
import { reshapeRawTown, reshapeRawTownWithDepartmentCode } from "./town-repository-reshape.js";

const findTownById = async (id: number): Promise<Town | null> => {
  const townResult = await kysely
    .selectFrom("commune")
    .select([
      sql<string>`id::text`.as("id"),
      "code",
      "nom",
      sql<string>`departement_id::text`.as("departementId"),
      "ownerId",
    ])
    .where("id", "=", id)
    .executeTakeFirst();

  return townResult ? townSchema.parse(reshapeRawTown(townResult)) : null;
};

const findTownByLocalityId = async (localityId: string | undefined): Promise<Town | null> => {
  if (!localityId) {
    return null;
  }

  const townResult = await kysely
    .selectFrom("commune")
    .leftJoin("lieudit", "commune.id", "lieudit.communeId")
    .select([
      sql<string>`commune.id::text`.as("id"),
      "commune.code",
      "commune.nom",
      sql<string>`commune.departement_id::text`.as("departementId"),
      "commune.ownerId",
    ])
    .where("lieudit.id", "=", Number.parseInt(localityId))
    .executeTakeFirst();

  return townResult ? townSchema.parse(reshapeRawTown(townResult)) : null;
};

const findTowns = async (
  { orderBy, sortOrder, q, departmentId, offset, limit }: TownFindManyInput = {},
  ownerId?: string,
): Promise<Town[]> => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryTown;

  switch (orderBy) {
    case "nbDonnees":
      queryTown = kysely
        .selectFrom("commune")
        .leftJoin("lieudit", "lieudit.communeId", "commune.id")
        .leftJoin("inventaire", "inventaire.lieuditId", "lieudit.id")
        .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
        .select([
          sql<string>`basenaturaliste.commune.id::text`.as("id"),
          "commune.code",
          "commune.nom",
          sql<string>`commune.departement_id::text`.as("departementId"),
          "commune.ownerId",
        ]);

      if (q?.length) {
        queryTown = queryTown.where((eb) =>
          eb.or([
            eb(sql`unaccent(commune.nom)`, "ilike", sql`unaccent(${`%${q}%`})`),
            eb(sql`CAST(commune.code as VARCHAR)`, "ilike", sql`${`${q}%`}`),
          ]),
        );
      }

      if (departmentId != null) {
        queryTown = queryTown.where("commune.departementId", "=", Number.parseInt(departmentId));
      }

      queryTown = queryTown
        .groupBy("commune.id")
        .orderBy(
          (eb) =>
            ownerId
              ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId)
              : eb.fn.count("donnee.id"),
          sortOrder ?? undefined,
        )
        .orderBy("commune.nom asc");

      break;
    case "nbLieuxDits":
      queryTown = kysely
        .selectFrom("commune")
        .leftJoin("lieudit", "lieudit.communeId", "commune.id")
        .select([
          sql<string>`basenaturaliste.commune.id::text`.as("id"),
          "commune.code",
          "commune.nom",
          sql<string>`commune.departement_id::text`.as("departementId"),
          "commune.ownerId",
        ]);

      if (q?.length) {
        queryTown = queryTown.where((eb) =>
          eb.or([
            eb(sql`unaccent(commune.nom)`, "ilike", sql`unaccent(${`%${q}%`})`),
            eb(sql`CAST(commune.code as VARCHAR)`, "ilike", sql`${`${q}%`}`),
          ]),
        );
      }

      if (departmentId != null) {
        queryTown = queryTown.where("commune.departementId", "=", Number.parseInt(departmentId));
      }

      queryTown = queryTown
        .groupBy("commune.id")
        .orderBy((eb) => eb.fn.count("lieudit.id"), sortOrder ?? undefined)
        .orderBy("commune.nom asc");

      break;
    case "departement":
      queryTown = kysely
        .selectFrom("commune")
        .leftJoin("departement", "departement.id", "commune.departementId")
        .select([
          sql<string>`basenaturaliste.commune.id::text`.as("id"),
          "commune.code",
          "commune.nom",
          sql<string>`commune.departement_id::text`.as("departementId"),
          "commune.ownerId",
        ]);

      if (q?.length) {
        queryTown = queryTown.where((eb) =>
          eb.or([
            eb(sql`unaccent(commune.nom)`, "ilike", sql`unaccent(${`%${q}%`})`),
            eb(sql`CAST(commune.code as VARCHAR)`, "ilike", sql`${`${q}%`}`),
          ]),
        );
      }

      if (departmentId != null) {
        queryTown = queryTown.where("commune.departementId", "=", Number.parseInt(departmentId));
      }

      queryTown = queryTown.orderBy("departement.code", sortOrder ?? undefined).orderBy("commune.nom asc");

      break;
    default:
      queryTown = kysely
        .selectFrom("commune")
        .select([
          sql<string>`basenaturaliste.commune.id::text`.as("id"),
          "commune.code",
          "commune.nom",
          sql<string>`commune.departement_id::text`.as("departementId"),
          "commune.ownerId",
        ]);

      if (q?.length) {
        queryTown = queryTown.where((eb) =>
          eb.or([
            eb(sql`unaccent(commune.nom)`, "ilike", sql`unaccent(${`%${q}%`})`),
            eb(sql`CAST(commune.code as VARCHAR)`, "ilike", sql`${`${q}%`}`),
          ]),
        );
      }

      if (departmentId != null) {
        queryTown = queryTown.where("commune.departementId", "=", Number.parseInt(departmentId));
      }

      if (orderBy) {
        queryTown = queryTown.orderBy(orderBy, sortOrder ?? undefined);
      } else {
        // If no explicit order is requested and a query is provided, return the matches in the following order:
        // The ones for which code matches with query
        // The ones for which code starts with query
        // The ones for which nom starts with query

        if (q?.length) {
          queryTown = queryTown
            .orderBy(sql`CAST(commune.code as VARCHAR) = ${q}`, "desc")
            .orderBy(sql`CAST(commune.code as VARCHAR) ilike ${`${q}%`}`, "desc")
            .orderBy(sql`commune.nom ilike ${`${q}%`}`, "desc");
        }

        // Then two groups are finally sorted alphabetically in any case
        queryTown = queryTown.orderBy("commune.nom asc");
      }

      break;
  }

  if (offset) {
    queryTown = queryTown.offset(offset);
  }
  if (limit) {
    queryTown = queryTown.limit(limit);
  }

  const townsResult = await queryTown.execute();

  return z.array(townSchema).parse(townsResult.map((town) => reshapeRawTown(town)));
};

const getCount = async (q?: string | null, departmentId?: string | null): Promise<number> => {
  let query = kysely.selectFrom("commune").select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where((eb) =>
      eb.or([
        eb(sql`unaccent(commune.nom)`, "ilike", sql`unaccent(${`%${q}%`})`),
        eb(sql`CAST(commune.code as VARCHAR)`, "ilike", sql`${`${q}%`}`),
      ]),
    );
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
    .leftJoin("lieudit", "lieudit.id", "inventaire.lieuditId")
    .select((eb) => eb.fn.count("donnee.id").distinct().as("count"))
    .where("lieudit.communeId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const findAllTownsWithDepartmentCode = async (): Promise<(Town & { departmentCode: string })[]> => {
  const townsWithDepartmentCode = await kysely
    .selectFrom("commune")
    .leftJoin("departement", "commune.departementId", "departement.id")
    .select([
      sql<string>`commune.id::text`.as("id"),
      "commune.code",
      "commune.nom",
      sql<string>`commune.departement_id::text`.as("departementId"),
      "commune.ownerId",
      "departement.code as departmentCode",
    ])
    .execute();

  return z
    .array(
      townSchema.extend({
        departmentCode: z.string(),
      }),
    )
    .parse(townsWithDepartmentCode.map((town) => reshapeRawTownWithDepartmentCode(town)));
};

const createTown = async (townInput: TownCreateInput): Promise<Result<Town, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("commune")
      .values({
        code: townInput.code,
        nom: townInput.nom,
        departementId: Number.parseInt(townInput.departmentId),
        ownerId: townInput.ownerId,
      })
      .returning([
        sql<string>`id::text`.as("id"),
        "code",
        "nom",
        sql<string>`departement_id::text`.as("departementId"),
        "ownerId",
      ])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdTown) => townSchema.parse(reshapeRawTown(createdTown)));
};

const createTowns = async (townInputs: TownCreateInput[]): Promise<Town[]> => {
  const createdTowns = await kysely
    .insertInto("commune")
    .values(
      townInputs.map((townInput) => {
        return {
          code: townInput.code,
          nom: townInput.nom,
          departementId: Number.parseInt(townInput.departmentId),
          ownerId: townInput.ownerId,
        };
      }),
    )
    .returning([
      sql<string>`id::text`.as("id"),
      "code",
      "nom",
      sql<string>`departement_id::text`.as("departementId"),
      "ownerId",
    ])
    .execute();

  return z
    .array(townSchema)
    .nonempty()
    .parse(createdTowns.map((createdTown) => reshapeRawTown(createdTown)));
};

const updateTown = async (townId: number, townInput: TownCreateInput): Promise<Result<Town, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("commune")
      .set({
        code: townInput.code,
        nom: townInput.nom,
        departementId: Number.parseInt(townInput.departmentId),
        ownerId: townInput.ownerId,
      })
      .where("id", "=", townId)
      .returning([
        sql<string>`id::text`.as("id"),
        "code",
        "nom",
        sql<string>`departement_id::text`.as("departementId"),
        "ownerId",
      ])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedTown) => townSchema.parse(reshapeRawTown(updatedTown)));
};

const deleteTownById = async (townId: number): Promise<Town | null> => {
  const deletedTown = await kysely
    .deleteFrom("commune")
    .where("id", "=", townId)
    .returning([
      sql<string>`id::text`.as("id"),
      "code",
      "nom",
      sql<string>`departement_id::text`.as("departementId"),
      "ownerId",
    ])
    .executeTakeFirst();

  return deletedTown ? townSchema.parse(reshapeRawTown(deletedTown)) : null;
};

export const townRepository = {
  findTownById,
  findTownByLocalityId,
  findTowns,
  getCount,
  getEntriesCountById,
  findAllTownsWithDepartmentCode,
  createTown,
  createTowns,
  updateTown,
  deleteTownById,
};
