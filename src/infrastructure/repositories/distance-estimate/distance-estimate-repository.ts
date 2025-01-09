import {
  type DistanceEstimate,
  type DistanceEstimateCreateInput,
  type DistanceEstimateFindManyInput,
  distanceEstimateSchema,
} from "@domain/distance-estimate/distance-estimate.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findDistanceEstimateById = async (id: number): Promise<DistanceEstimate | null> => {
  const distanceEstimateResult = await kysely
    .selectFrom("estimation_distance")
    .select([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return distanceEstimateResult ? distanceEstimateSchema.parse(distanceEstimateResult) : null;
};

const findDistanceEstimates = async (
  { orderBy, sortOrder, q, offset, limit }: DistanceEstimateFindManyInput = {},
  ownerId?: string,
): Promise<DistanceEstimate[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryDistanceEstimate;

  if (isSortByNbDonnees) {
    queryDistanceEstimate = kysely
      .selectFrom("estimation_distance")
      .leftJoin("donnee", "donnee.estimationDistanceId", "estimation_distance.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .select([
        sql`basenaturaliste.estimation_distance.id::text`.as("id"),
        "estimation_distance.libelle",
        "estimation_distance.ownerId",
      ]);

    if (q?.length) {
      queryDistanceEstimate = queryDistanceEstimate.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    queryDistanceEstimate = queryDistanceEstimate
      .groupBy("estimation_distance.id")
      .orderBy(
        (eb) =>
          ownerId ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId) : eb.fn.count("donnee.id"),
        sortOrder ?? undefined,
      )
      .orderBy("estimation_distance.libelle asc");
  } else {
    queryDistanceEstimate = kysely
      .selectFrom("estimation_distance")
      .select([sql`basenaturaliste.estimation_distance.id::text`.as("id"), "libelle", "ownerId"]);

    if (q?.length) {
      queryDistanceEstimate = queryDistanceEstimate.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    if (orderBy) {
      queryDistanceEstimate = queryDistanceEstimate.orderBy(orderBy, sortOrder ?? undefined);
    }
  }

  if (offset) {
    queryDistanceEstimate = queryDistanceEstimate.offset(offset);
  }

  if (limit) {
    queryDistanceEstimate = queryDistanceEstimate.limit(limit);
  }

  const distanceEstimatesResult = await queryDistanceEstimate.execute();

  return z.array(distanceEstimateSchema).parse(distanceEstimatesResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("estimation_distance").select((eb) => eb.fn.countAll().as("count"));

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
    .select((eb) => eb.fn.countAll().as("count"))
    .where("estimationDistanceId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createDistanceEstimate = async (
  distanceEstimateInput: DistanceEstimateCreateInput,
): Promise<Result<DistanceEstimate, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("estimation_distance")
      .values({
        libelle: distanceEstimateInput.libelle,
        ownerId: distanceEstimateInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdDistanceEstimate) => distanceEstimateSchema.parse(createdDistanceEstimate));
};

const createDistanceEstimates = async (
  distanceEstimateInputs: DistanceEstimateCreateInput[],
): Promise<DistanceEstimate[]> => {
  const createdDistanceEstimates = await kysely
    .insertInto("estimation_distance")
    .values(
      distanceEstimateInputs.map((distanceEstimateInput) => {
        return {
          libelle: distanceEstimateInput.libelle,
          ownerId: distanceEstimateInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .execute();

  return z.array(distanceEstimateSchema).nonempty().parse(createdDistanceEstimates);
};

const updateDistanceEstimate = async (
  distanceEstimateId: number,
  distanceEstimateInput: DistanceEstimateCreateInput,
): Promise<Result<DistanceEstimate, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("estimation_distance")
      .set({
        libelle: distanceEstimateInput.libelle,
        ownerId: distanceEstimateInput.ownerId,
      })
      .where("id", "=", distanceEstimateId)
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedDistanceEstimate) => distanceEstimateSchema.parse(updatedDistanceEstimate));
};

const deleteDistanceEstimateById = async (distanceEstimateId: number): Promise<DistanceEstimate | null> => {
  const deletedDistanceEstimate = await kysely
    .deleteFrom("estimation_distance")
    .where("id", "=", distanceEstimateId)
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .executeTakeFirst();

  return deletedDistanceEstimate ? distanceEstimateSchema.parse(deletedDistanceEstimate) : null;
};

export const distanceEstimateRepository = {
  findDistanceEstimateById,
  findDistanceEstimates,
  getCount,
  getEntriesCountById,
  createDistanceEstimate,
  createDistanceEstimates,
  updateDistanceEstimate,
  deleteDistanceEstimateById,
};
