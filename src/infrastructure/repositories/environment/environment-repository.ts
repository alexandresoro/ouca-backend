import {
  type Environment,
  type EnvironmentCreateInput,
  type EnvironmentFindManyInput,
  environmentSchema,
} from "@domain/environment/environment.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findEnvironmentById = async (id: number): Promise<Environment | null> => {
  const environmentResult = await kysely
    .selectFrom("milieu")
    .select([sql<string>`id::text`.as("id"), "code", "libelle", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return environmentResult ? environmentSchema.parse(environmentResult) : null;
};

const findEnvironmentsById = async (ids: string[]): Promise<Environment[]> => {
  const environmentsResult = await kysely
    .selectFrom("milieu")
    .select([sql<string>`id::text`.as("id"), "code", "libelle", "ownerId"])
    .where(
      "milieu.id",
      "in",
      ids.map((id) => Number.parseInt(id)),
    )
    .execute();

  return z.array(environmentSchema).parse(environmentsResult);
};

const findEnvironments = async (
  { orderBy, sortOrder, q, offset, limit }: EnvironmentFindManyInput = {},
  ownerId?: string,
): Promise<Environment[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryEnvironment;

  if (isSortByNbDonnees) {
    queryEnvironment = kysely
      .selectFrom("milieu")
      .leftJoin("donnee_milieu", "milieu.id", "donnee_milieu.milieuId")
      .leftJoin("donnee", "donnee_milieu.donneeId", "donnee.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .select([sql`basenaturaliste.milieu.id::text`.as("id"), "milieu.code", "milieu.libelle", "milieu.ownerId"]);

    if (q?.length) {
      queryEnvironment = queryEnvironment.where((eb) =>
        eb.or([
          eb("code", "ilike", sql<string>`unaccent(${`${q}%`})`),
          eb(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`),
        ]),
      );
    }

    queryEnvironment = queryEnvironment
      .groupBy("milieu.id")
      .orderBy(
        (eb) =>
          ownerId ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId) : eb.fn.count("donnee.id"),
        sortOrder ?? undefined,
      )
      .orderBy("milieu.code asc");
  } else {
    queryEnvironment = kysely
      .selectFrom("milieu")
      .select([sql`basenaturaliste.milieu.id::text`.as("id"), "milieu.code", "milieu.libelle", "milieu.ownerId"]);

    if (q?.length) {
      queryEnvironment = queryEnvironment.where((eb) =>
        eb.or([
          eb("code", "ilike", sql<string>`unaccent(${`${q}%`})`),
          eb(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`),
        ]),
      );
    }

    if (orderBy) {
      queryEnvironment = queryEnvironment.orderBy(orderBy, sortOrder ?? undefined);
    } else if (q?.length) {
      queryEnvironment = queryEnvironment.orderBy(sql`milieu.code ilike ${`${q}%`}`, "desc");
    }

    queryEnvironment = queryEnvironment.orderBy("milieu.code asc");
  }

  if (offset) {
    queryEnvironment = queryEnvironment.offset(offset);
  }
  if (limit) {
    queryEnvironment = queryEnvironment.limit(limit);
  }

  const environmentResult = await queryEnvironment.execute();

  return z.array(environmentSchema).parse(environmentResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("milieu").select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where((eb) =>
      eb.or([
        eb("code", "ilike", sql<string>`unaccent(${`${q}%`})`),
        eb(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`),
      ]),
    );
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getEntriesCountById = async (id: string, ownerId?: string): Promise<number> => {
  let countResultQuery = kysely
    .selectFrom("donnee_milieu")
    .leftJoin("donnee", "donnee_milieu.donneeId", "donnee.id")
    .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
    .select((eb) => eb.fn.count("donnee_milieu.donneeId").distinct().as("count"))
    .where("milieuId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createEnvironment = async (
  environmentInput: EnvironmentCreateInput,
): Promise<Result<Environment, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("milieu")
      .values({
        code: environmentInput.code,
        libelle: environmentInput.libelle,
        ownerId: environmentInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "code", "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdEnvironment) => environmentSchema.parse(createdEnvironment));
};

const createEnvironments = async (environmentInputs: EnvironmentCreateInput[]): Promise<Environment[]> => {
  const createdEnvironments = await kysely
    .insertInto("milieu")
    .values(
      environmentInputs.map((environmentInput) => {
        return {
          code: environmentInput.code,
          libelle: environmentInput.libelle,
          ownerId: environmentInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "code", "libelle", "ownerId"])
    .execute();

  return z.array(environmentSchema).parse(createdEnvironments);
};

const updateEnvironment = async (
  environmentId: number,
  environmentInput: EnvironmentCreateInput,
): Promise<Result<Environment, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("milieu")
      .set({
        code: environmentInput.code,
        libelle: environmentInput.libelle,
        ownerId: environmentInput.ownerId,
      })
      .where("id", "=", environmentId)
      .returning([sql`id::text`.as("id"), "code", "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedEnvironment) => environmentSchema.parse(updatedEnvironment));
};

const deleteEnvironmentById = async (environmentId: number): Promise<Environment | null> => {
  const deletedEnvironment = await kysely
    .deleteFrom("milieu")
    .where("id", "=", environmentId)
    .returning([sql<string>`id::text`.as("id"), "code", "libelle", "ownerId"])
    .executeTakeFirst();

  return deletedEnvironment ? environmentSchema.parse(deletedEnvironment) : null;
};

export const environmentRepository = {
  findEnvironmentById,
  findEnvironmentsById,
  findEnvironments,
  getCount,
  getEntriesCountById,
  createEnvironment,
  createEnvironments,
  updateEnvironment,
  deleteEnvironmentById,
};
