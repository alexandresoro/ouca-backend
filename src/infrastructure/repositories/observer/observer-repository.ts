import {
  type Observer,
  type ObserverCreateInput,
  type ObserverFindManyInput,
  observerSchema,
} from "@domain/observer/observer.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import escapeStringRegexp from "escape-string-regexp";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findObserverById = async (id: number): Promise<Observer | null> => {
  const observerResult = await kysely
    .selectFrom("observateur")
    .select([sql<string>`basenaturaliste.observateur.id::text`.as("id"), "libelle", "observateur.ownerId"])
    .where("observateur.id", "=", id)
    .executeTakeFirst();

  return observerResult ? observerSchema.parse(observerResult) : null;
};

const findObserversById = async (ids: string[]): Promise<Observer[]> => {
  const observersResult = await kysely
    .selectFrom("observateur")
    .select([sql<string>`basenaturaliste.observateur.id::text`.as("id"), "libelle", "observateur.ownerId"])
    .where(
      "observateur.id",
      "in",
      ids.map((id) => Number.parseInt(id)),
    )
    .execute();

  return z.array(observerSchema).parse(observersResult);
};

const findObservers = async (
  { orderBy, sortOrder, q, offset, limit }: ObserverFindManyInput = {},
  ownerId?: string,
): Promise<Observer[]> => {
  const isSortByNbDonnees = orderBy === "nbDonnees";

  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryObs;
  if (isSortByNbDonnees) {
    const countFromDirectObserversAndAssociatesQuery = kysely
      .selectFrom("observateur")
      .leftJoin("inventaire", "inventaire.observateurId", "observateur.id")
      .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
      .select((eb) => [
        sql`basenaturaliste.observateur.id::text`.as("id"),
        "libelle",
        "observateur.ownerId",
        ownerId
          ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId).as("count")
          : eb.fn.count("donnee.id").as("count"),
      ])
      .groupBy("observateur.id")
      .union(
        kysely
          .selectFrom("observateur")
          .leftJoin("inventaire_associe", "inventaire_associe.observateurId", "observateur.id")
          .leftJoin("inventaire", "inventaire.id", "inventaire_associe.inventaireId")
          .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
          .select((eb) => [
            sql`basenaturaliste.observateur.id::text`.as("id"),
            "libelle",
            "observateur.ownerId",
            ownerId
              ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId).as("count")
              : eb.fn.count("donnee.id").as("count"),
          ])
          .groupBy("observateur.id"),
      )
      .as("res");

    queryObs = kysely.selectFrom(countFromDirectObserversAndAssociatesQuery).select(["id", "libelle", "ownerId"]);

    if (q?.length) {
      queryObs = queryObs.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    queryObs = queryObs
      .groupBy("id")
      .groupBy("libelle")
      .groupBy("ownerId")
      .orderBy((eb) => eb.fn.sum("count"), sortOrder ?? undefined)
      .orderBy("libelle asc");
  } else {
    queryObs = kysely
      .selectFrom("observateur")
      .select([sql`basenaturaliste.observateur.id::text`.as("id"), "libelle", "observateur.ownerId"]);

    if (q?.length) {
      queryObs = queryObs.where(sql`unaccent(libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
    }

    if (orderBy) {
      queryObs = queryObs.orderBy(orderBy, sortOrder ?? undefined);
    } else if (q) {
      // If no explicit order is requested and a query is provided, return the matches in the following order:
      // The ones for which libelle starts with query
      // Then the ones which libelle contains the query
      // Then two groups are finally sorted alphabetically
      queryObs = queryObs
        .orderBy(sql`"basenaturaliste"."observateur"."libelle" ~* ${`^${escapeStringRegexp(q)}`}`, "desc")
        .orderBy("libelle", "asc");
    }
  }

  if (offset) {
    queryObs = queryObs.offset(offset);
  }
  if (limit) {
    queryObs = queryObs.limit(limit);
  }

  const observersResult = await queryObs.execute();

  return z.array(observerSchema).parse(observersResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("observateur").select((eb) => eb.fn.countAll().as("count"));

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
    .leftJoin("inventaire_associe", "inventaire_associe.inventaireId", "inventaire.id")
    .select((eb) => eb.fn.count("donnee.id").distinct().as("count"))
    .where((eb) =>
      eb.or([
        eb("inventaire.observateurId", "=", Number.parseInt(id)),
        eb("inventaire_associe.observateurId", "=", Number.parseInt(id)),
      ]),
    );

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createObserver = async (observerInput: ObserverCreateInput): Promise<Result<Observer, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("observateur")
      .values({
        libelle: observerInput.libelle,
        ownerId: observerInput.ownerId,
      })
      .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdObserver) => observerSchema.parse(createdObserver));
};

const createObservers = async (observerInputs: ObserverCreateInput[]): Promise<Observer[]> => {
  const createdObservers = await kysely
    .insertInto("observateur")
    .values(
      observerInputs.map((observerInput) => {
        return {
          libelle: observerInput.libelle,
          ownerId: observerInput.ownerId,
        };
      }),
    )
    .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
    .execute();

  return z.array(observerSchema).nonempty().parse(createdObservers);
};

const updateObserver = async (
  observateurId: number,
  observateurInput: ObserverCreateInput,
): Promise<Result<Observer, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("observateur")
      .set({
        libelle: observateurInput.libelle,
        ownerId: observateurInput.ownerId,
      })
      .where("id", "=", observateurId)
      .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedObserver) => observerSchema.parse(updatedObserver));
};

const deleteObserverById = async (observerId: number): Promise<Observer | null> => {
  const deletedObserver = await kysely
    .deleteFrom("observateur")
    .where("id", "=", observerId)
    .returning([sql`id::text`.as("id"), "libelle", "ownerId"])
    .executeTakeFirst();

  return deletedObserver ? observerSchema.parse(deletedObserver) : null;
};

export const observerRepository = {
  findObserverById,
  findObserversById,
  findObservers,
  getCount,
  getEntriesCountById,
  createObserver,
  createObservers,
  updateObserver,
  deleteObserverById,
};
