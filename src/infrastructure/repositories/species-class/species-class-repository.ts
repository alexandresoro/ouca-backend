import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import {
  type SpeciesClass,
  type SpeciesClassCreateInput,
  type SpeciesClassFindManyInput,
  speciesClassSchema,
} from "@domain/species-class/species-class.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findSpeciesClassById = async (id: number): Promise<SpeciesClass | null> => {
  const speciesClassResult = await kysely
    .selectFrom("classe")
    .select([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return speciesClassResult ? speciesClassSchema.parse(speciesClassResult) : null;
};

const findSpeciesClassBySpeciesId = async (speciesId: number | undefined): Promise<SpeciesClass | null> => {
  if (!speciesId) {
    return null;
  }

  const speciesClassResult = await kysely
    .selectFrom("classe")
    .leftJoin("espece", "espece.classeId", "classe.id")
    .select([sql`basenaturaliste.classe.id::text`.as("id"), "classe.libelle", "classe.ownerId"])
    .where("espece.id", "=", speciesId)
    .executeTakeFirst();

  return speciesClassResult ? speciesClassSchema.parse(speciesClassResult) : null;
};

const findSpeciesClasses = async (
  { orderBy, sortOrder, q, offset, limit }: SpeciesClassFindManyInput = {},
  ownerId?: string,
): Promise<SpeciesClass[]> => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let querySpeciesClass;

  switch (orderBy) {
    case "nbDonnees":
      querySpeciesClass = kysely
        .selectFrom("classe")
        .leftJoin("espece", "espece.classeId", "classe.id")
        .leftJoin("donnee", "donnee.especeId", "espece.id")
        .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
        .select([sql`basenaturaliste.classe.id::text`.as("id"), "classe.libelle", "classe.ownerId"]);

      if (q?.length) {
        querySpeciesClass = querySpeciesClass.where(sql`unaccent(classe.libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      querySpeciesClass = querySpeciesClass
        .groupBy("classe.id")
        .orderBy(
          (eb) =>
            ownerId
              ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId)
              : eb.fn.count("donnee.id"),
          sortOrder ?? undefined,
        )
        .orderBy("classe.libelle asc");

      break;
    case "nbEspeces":
      querySpeciesClass = kysely
        .selectFrom("classe")
        .leftJoin("espece", "espece.classeId", "classe.id")
        .select([sql`basenaturaliste.classe.id::text`.as("id"), "classe.libelle", "classe.ownerId"]);

      if (q?.length) {
        querySpeciesClass = querySpeciesClass.where(sql`unaccent(classe.libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      querySpeciesClass = querySpeciesClass
        .groupBy("classe.id")
        .orderBy((eb) => eb.fn.count("espece.id"), sortOrder ?? undefined)
        .orderBy("classe.libelle asc");

      break;
    default:
      querySpeciesClass = kysely
        .selectFrom("classe")
        .select([sql`basenaturaliste.classe.id::text`.as("id"), "classe.libelle", "classe.ownerId"]);

      if (q?.length) {
        querySpeciesClass = querySpeciesClass.where(sql`unaccent(classe.libelle)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      if (orderBy) {
        querySpeciesClass = querySpeciesClass.orderBy(orderBy, sortOrder ?? undefined);
      }

      querySpeciesClass = querySpeciesClass.orderBy("classe.libelle asc");

      break;
  }

  if (offset) {
    querySpeciesClass = querySpeciesClass.offset(offset);
  }

  if (limit) {
    querySpeciesClass = querySpeciesClass.limit(limit);
  }

  const speciesClassesResult = await querySpeciesClass.execute();

  return z.array(speciesClassSchema).parse(speciesClassesResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("classe").select((eb) => eb.fn.countAll().as("count"));

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
    .leftJoin("espece", "espece.id", "donnee.especeId")
    .select((eb) => eb.fn.count("donnee.id").distinct().as("count"))
    .where("espece.classeId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createSpeciesClass = async (
  speciesClassInput: SpeciesClassCreateInput,
): Promise<Result<SpeciesClass, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("classe")
      .values({
        libelle: speciesClassInput.libelle,
        ownerId: speciesClassInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdSpeciesClass) => speciesClassSchema.parse(createdSpeciesClass));
};

const createSpeciesClasses = async (speciesClassInputs: SpeciesClassCreateInput[]): Promise<SpeciesClass[]> => {
  const createdSpeciesClasses = await kysely
    .insertInto("classe")
    .values(
      speciesClassInputs.map((speciesClassInput) => {
        return {
          libelle: speciesClassInput.libelle,
          ownerId: speciesClassInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .execute();

  return z.array(speciesClassSchema).nonempty().parse(createdSpeciesClasses);
};

const updateSpeciesClass = async (
  speciesClassId: number,
  speciesClassInput: SpeciesClassCreateInput,
): Promise<Result<SpeciesClass, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("classe")
      .set({
        libelle: speciesClassInput.libelle,
        ownerId: speciesClassInput.ownerId,
      })
      .where("id", "=", speciesClassId)
      .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedSpeciesClass) => speciesClassSchema.parse(updatedSpeciesClass));
};

const deleteSpeciesClassById = async (speciesClassId: number): Promise<SpeciesClass | null> => {
  const deletedSpeciesClass = await kysely
    .deleteFrom("classe")
    .where("id", "=", speciesClassId)
    .returning([sql<string>`id::text`.as("id"), "libelle", "ownerId"])
    .executeTakeFirst();

  return deletedSpeciesClass ? speciesClassSchema.parse(deletedSpeciesClass) : null;
};

export const speciesClassRepository = {
  findSpeciesClassById,
  findSpeciesClassBySpeciesId,
  findSpeciesClasses,
  getCount,
  getEntriesCountById,
  createSpeciesClass,
  createSpeciesClasses,
  updateSpeciesClass,
  deleteSpeciesClassById,
};
