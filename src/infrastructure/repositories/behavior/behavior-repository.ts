import {
  type Behavior,
  type BehaviorCreateInput,
  type BehaviorFindManyInput,
  behaviorSchema,
} from "@domain/behavior/behavior.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import escapeStringRegexp from "escape-string-regexp";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findBehaviorById = async (id: number): Promise<Behavior | null> => {
  const behaviorResult = await kysely
    .selectFrom("comportement")
    .select([sql<string>`id::text`.as("id"), "code", "libelle", "nicheur", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return behaviorResult ? behaviorSchema.parse(behaviorResult) : null;
};

const findBehaviorsById = async (ids: string[]): Promise<Behavior[]> => {
  const behaviorsResult = await kysely
    .selectFrom("comportement")
    .select([sql<string>`id::text`.as("id"), "code", "libelle", "nicheur", "ownerId"])
    .where(
      "comportement.id",
      "in",
      ids.map((id) => Number.parseInt(id)),
    )
    .execute();

  return z.array(behaviorSchema).parse(behaviorsResult);
};

const findBehaviors = async (
  { orderBy, sortOrder, q, offset, limit }: BehaviorFindManyInput = {},
  ownerId?: string,
): Promise<Behavior[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryBehavior;

  if (isSortByNbDonnees) {
    queryBehavior = kysely
      .selectFrom("comportement")
      .leftJoin("donnee_comportement", "comportement.id", "donnee_comportement.comportementId")
      .leftJoin("donnee", "donnee_comportement.donneeId", "donnee.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .select([
        sql`basenaturaliste.comportement.id::text`.as("id"),
        "comportement.code",
        "comportement.libelle",
        "comportement.nicheur",
        "comportement.ownerId",
      ]);

    if (q?.length) {
      queryBehavior = queryBehavior.where((eb) =>
        eb.or([
          eb("code", "~*", sql<string>`${`^0*${escapeStringRegexp(q)}`}`),
          eb(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`),
        ]),
      );
    }

    queryBehavior = queryBehavior
      .groupBy("comportement.id")
      .orderBy(
        (eb) =>
          ownerId ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId) : eb.fn.count("donnee.id"),
        sortOrder ?? undefined,
      )
      .orderBy("comportement.code asc");
  } else {
    queryBehavior = kysely
      .selectFrom("comportement")
      .select([
        sql`basenaturaliste.comportement.id::text`.as("id"),
        "comportement.code",
        "comportement.libelle",
        "comportement.nicheur",
        "comportement.ownerId",
      ]);

    if (q?.length) {
      queryBehavior = queryBehavior.where((eb) =>
        eb.or([
          eb("code", "~*", sql<string>`${`^0*${escapeStringRegexp(q)}`}`),
          eb(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`),
        ]),
      );
    }

    if (orderBy) {
      queryBehavior = queryBehavior.orderBy(orderBy, sortOrder ?? undefined);
    } else if (q?.length) {
      queryBehavior = queryBehavior.orderBy(sql`comportement.code ~* ${`^0*${escapeStringRegexp(q)}`}`, "desc");
    }

    queryBehavior = queryBehavior.orderBy("comportement.code asc");
  }

  if (offset) {
    queryBehavior = queryBehavior.offset(offset);
  }
  if (limit) {
    queryBehavior = queryBehavior.limit(limit);
  }

  const behaviorResult = await queryBehavior.execute();

  return z.array(behaviorSchema).parse(behaviorResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("comportement").select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where((eb) =>
      eb.or([
        eb("code", "~*", sql<string>`${`^0*${escapeStringRegexp(q)}`}`),
        eb(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`),
      ]),
    );
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getEntriesCountById = async (id: string, ownerId?: string): Promise<number> => {
  let countResultQuery = kysely
    .selectFrom("donnee_comportement")
    .leftJoin("donnee", "donnee_comportement.donneeId", "donnee.id")
    .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
    .select((eb) => eb.fn.count("donnee_comportement.donneeId").distinct().as("count"))
    .where("comportementId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createBehavior = async (behaviorInput: BehaviorCreateInput): Promise<Result<Behavior, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("comportement")
      .values({
        code: behaviorInput.code,
        libelle: behaviorInput.libelle,
        nicheur: behaviorInput.nicheur,
        ownerId: behaviorInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "code", "libelle", "nicheur", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdBehavior) => behaviorSchema.parse(createdBehavior));
};

const createBehaviors = async (behaviorInputs: BehaviorCreateInput[]): Promise<Behavior[]> => {
  const createdBehaviors = await kysely
    .insertInto("comportement")
    .values(
      behaviorInputs.map((behaviorInput) => {
        return {
          code: behaviorInput.code,
          libelle: behaviorInput.libelle,
          nicheur: behaviorInput.nicheur,
          ownerId: behaviorInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "code", "libelle", "nicheur", "ownerId"])
    .execute();

  return z.array(behaviorSchema).parse(createdBehaviors);
};

const updateBehavior = async (
  behaviorId: number,
  behaviorInput: BehaviorCreateInput,
): Promise<Result<Behavior, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("comportement")
      .set({
        code: behaviorInput.code,
        libelle: behaviorInput.libelle,
        nicheur: behaviorInput.nicheur,
        ownerId: behaviorInput.ownerId,
      })
      .where("id", "=", behaviorId)
      .returning([sql`id::text`.as("id"), "code", "libelle", "nicheur", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedBehavior) => behaviorSchema.parse(updatedBehavior));
};

const deleteBehaviorById = async (behaviorId: number): Promise<Behavior | null> => {
  const deletedBehavior = await kysely
    .deleteFrom("comportement")
    .where("id", "=", behaviorId)
    .returning([sql<string>`id::text`.as("id"), "code", "libelle", "nicheur", "ownerId"])
    .executeTakeFirst();

  return deletedBehavior ? behaviorSchema.parse(deletedBehavior) : null;
};

export const behaviorRepository = {
  findBehaviorById,
  findBehaviorsById,
  findBehaviors,
  getCount,
  getEntriesCountById,
  createBehavior,
  createBehaviors,
  updateBehavior,
  deleteBehaviorById,
};
