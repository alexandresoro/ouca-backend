import { type Sex, type SexCreateInput, type SexFindManyInput, sexSchema } from "@domain/sex/sex.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findSexById = async (id: number): Promise<Sex | null> => {
  const sexResult = await kysely
    .selectFrom("sexe")
    .select([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return sexResult ? sexSchema.parse(sexResult) : null;
};

const findSexes = async (
  { orderBy, sortOrder, q, offset, limit }: SexFindManyInput = {},
  ownerId?: string,
): Promise<Sex[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let querySex;

  if (isSortByNbDonnees) {
    querySex = kysely
      .selectFrom("sexe")
      .leftJoin("donnee", "donnee.sexeId", "sexe.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .select([sql`basenaturaliste.sexe.id::text`.as("id"), "libelle", "sexe.ownerId"]);

    if (q?.length) {
      querySex = querySex.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    querySex = querySex
      .groupBy("sexe.id")
      .orderBy(
        (eb) =>
          ownerId ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId) : eb.fn.count("donnee.id"),
        sortOrder ?? undefined,
      )
      .orderBy("sexe.libelle asc");
  } else {
    querySex = kysely
      .selectFrom("sexe")
      .select([sql`basenaturaliste.sexe.id::text`.as("id"), "libelle", "sexe.ownerId"]);

    if (q?.length) {
      querySex = querySex.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    if (orderBy) {
      querySex = querySex.orderBy(orderBy, sortOrder ?? undefined);
    }
  }

  if (offset) {
    querySex = querySex.offset(offset);
  }
  if (limit) {
    querySex = querySex.limit(limit);
  }

  const sexesResult = await querySex.execute();

  return z.array(sexSchema).parse(sexesResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("sexe").select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getEntriesCountById = async (id: string, ownerId?: string): Promise<number> => {
  let countResultQuery = kysely
    .selectFrom("donnee")
    .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("sexeId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createSex = async (sexInput: SexCreateInput): Promise<Result<Sex, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("sexe")
      .values({
        libelle: sexInput.libelle,
        ownerId: sexInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdSex) => sexSchema.parse(createdSex));
};

const createSexes = async (sexInputs: SexCreateInput[]): Promise<Sex[]> => {
  const createdSexes = await kysely
    .insertInto("sexe")
    .values(
      sexInputs.map((sexInput) => {
        return {
          libelle: sexInput.libelle,
          ownerId: sexInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .execute();

  return z.array(sexSchema).nonempty().parse(createdSexes);
};

const updateSex = async (sexId: number, sexInput: SexCreateInput): Promise<Result<Sex, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("sexe")
      .set({
        libelle: sexInput.libelle,
        ownerId: sexInput.ownerId,
      })
      .where("id", "=", sexId)
      .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedSex) => sexSchema.parse(updatedSex));
};

const deleteSexById = async (sexId: number): Promise<Sex | null> => {
  const deletedSex = await kysely
    .deleteFrom("sexe")
    .where("id", "=", sexId)
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .executeTakeFirst();

  return deletedSex ? sexSchema.parse(deletedSex) : null;
};

export const sexRepository = {
  findSexById,
  findSexes,
  getCount,
  getEntriesCountById,
  createSex,
  createSexes,
  updateSex,
  deleteSexById,
};
