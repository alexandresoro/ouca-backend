import {
  type NumberEstimate,
  type NumberEstimateCreateInput,
  type NumberEstimateFindManyInput,
  numberEstimateSchema,
} from "@domain/number-estimate/number-estimate.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findNumberEstimateById = async (id: number): Promise<NumberEstimate | null> => {
  const numberEstimateResult = await kysely
    .selectFrom("estimation_nombre")
    .select([sql<string>`id::text`.as("id"), "libelle", "nonCompte", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return numberEstimateResult ? numberEstimateSchema.parse(numberEstimateResult) : null;
};

const findNumberEstimates = async (
  { orderBy, sortOrder, q, offset, limit }: NumberEstimateFindManyInput = {},
  ownerId?: string,
): Promise<NumberEstimate[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryNumberEstimate;

  if (isSortByNbDonnees) {
    queryNumberEstimate = kysely
      .selectFrom("estimation_nombre")
      .leftJoin("donnee", "donnee.estimationNombreId", "estimation_nombre.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .select([
        sql`basenaturaliste.estimation_nombre.id::text`.as("id"),
        "estimation_nombre.libelle",
        "estimation_nombre.nonCompte",
        "estimation_nombre.ownerId",
      ]);

    if (q?.length) {
      queryNumberEstimate = queryNumberEstimate.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    queryNumberEstimate = queryNumberEstimate
      .groupBy("estimation_nombre.id")
      .orderBy(
        (eb) =>
          ownerId ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId) : eb.fn.count("donnee.id"),
        sortOrder ?? undefined,
      )
      .orderBy("estimation_nombre.libelle asc");
  } else {
    queryNumberEstimate = kysely
      .selectFrom("estimation_nombre")
      .select([sql`basenaturaliste.estimation_nombre.id::text`.as("id"), "libelle", "nonCompte", "ownerId"]);

    if (q?.length) {
      queryNumberEstimate = queryNumberEstimate.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    if (orderBy) {
      queryNumberEstimate = queryNumberEstimate.orderBy(orderBy, sortOrder ?? undefined);
    }
  }

  if (offset) {
    queryNumberEstimate = queryNumberEstimate.offset(offset);
  }

  if (limit) {
    queryNumberEstimate = queryNumberEstimate.limit(limit);
  }

  const numberEstimatesResult = await queryNumberEstimate.execute();

  return z.array(numberEstimateSchema).parse(numberEstimatesResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("estimation_nombre").select((eb) => eb.fn.countAll().as("count"));

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
    .where("estimationNombreId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createNumberEstimate = async (
  numberEstimateInput: NumberEstimateCreateInput,
): Promise<Result<NumberEstimate, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("estimation_nombre")
      .values({
        libelle: numberEstimateInput.libelle,
        nonCompte: numberEstimateInput.nonCompte,
        ownerId: numberEstimateInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "libelle", "nonCompte", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdNumberEstimate) => numberEstimateSchema.parse(createdNumberEstimate));
};

const createNumberEstimates = async (numberEstimateInputs: NumberEstimateCreateInput[]): Promise<NumberEstimate[]> => {
  const createdNumberEstimates = await kysely
    .insertInto("estimation_nombre")
    .values(
      numberEstimateInputs.map((numberEstimateInput) => {
        return {
          libelle: numberEstimateInput.libelle,
          nonCompte: numberEstimateInput.nonCompte,
          ownerId: numberEstimateInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "libelle", "nonCompte", "ownerId"])
    .execute();

  return z.array(numberEstimateSchema).nonempty().parse(createdNumberEstimates);
};

const updateNumberEstimate = async (
  numberEstimateId: number,
  numberEstimateInput: NumberEstimateCreateInput,
): Promise<Result<NumberEstimate, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("estimation_nombre")
      .set({
        libelle: numberEstimateInput.libelle,
        nonCompte: numberEstimateInput.nonCompte,
        ownerId: numberEstimateInput.ownerId,
      })
      .where("id", "=", numberEstimateId)
      .returning([sql<string>`id::text`.as("id"), "libelle", "nonCompte", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedNumberEstimate) => numberEstimateSchema.parse(updatedNumberEstimate));
};

const deleteNumberEstimateById = async (numberEstimateId: number): Promise<NumberEstimate | null> => {
  const deletedNumberEstimate = await kysely
    .deleteFrom("estimation_nombre")
    .where("id", "=", numberEstimateId)
    .returning([sql<string>`id::text`.as("id"), "libelle", "nonCompte", "ownerId"])
    .executeTakeFirst();

  return deletedNumberEstimate ? numberEstimateSchema.parse(deletedNumberEstimate) : null;
};

export const numberEstimateRepository = {
  findNumberEstimateById,
  findNumberEstimates,
  getCount,
  getEntriesCountById,
  createNumberEstimate,
  createNumberEstimates,
  updateNumberEstimate,
  deleteNumberEstimateById,
};
