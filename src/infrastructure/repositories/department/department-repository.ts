import {
  type Department,
  type DepartmentCreateInput,
  type DepartmentFindManyInput,
  departmentSchema,
} from "@domain/department/department.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import { handleDatabaseError } from "@infrastructure/kysely/database-errors.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import escapeStringRegexp from "escape-string-regexp";
import { sql } from "kysely";
import { type Result, fromPromise } from "neverthrow";
import { z } from "zod";
import { countSchema } from "../common.js";

const findDepartmentById = async (id: number): Promise<Department | null> => {
  const departmentResult = await kysely
    .selectFrom("departement")
    .select([sql<string>`id::text`.as("id"), "code", "ownerId"])
    .where("id", "=", id)
    .executeTakeFirst();

  return departmentResult ? departmentSchema.parse(departmentResult) : null;
};

const findDepartmentByTownId = async (townId: number | undefined): Promise<Department | null> => {
  if (!townId) {
    return null;
  }

  const departmentResult = await kysely
    .selectFrom("departement")
    .leftJoin("commune", "commune.departementId", "departement.id")
    .select([sql<string>`basenaturaliste.departement.id::text`.as("id"), "departement.code", "departement.ownerId"])
    .where("commune.id", "=", townId)
    .executeTakeFirst();

  return departmentResult ? departmentSchema.parse(departmentResult) : null;
};

const findDepartments = async (
  { orderBy, sortOrder, q, offset, limit }: DepartmentFindManyInput = {},
  ownerId?: string,
): Promise<Department[]> => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let queryDepartment;

  switch (orderBy) {
    case "nbDonnees":
      queryDepartment = kysely
        .selectFrom("departement")
        .leftJoin("commune", "commune.departementId", "departement.id")
        .leftJoin("lieudit", "lieudit.communeId", "commune.id")
        .leftJoin("inventaire", "inventaire.lieuditId", "lieudit.id")
        .leftJoin("donnee", "donnee.inventaireId", "inventaire.id")
        .select([sql`basenaturaliste.departement.id::text`.as("id"), "departement.code", "departement.ownerId"]);

      if (q?.length) {
        queryDepartment = queryDepartment.where(sql`unaccent(departement.code)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      queryDepartment = queryDepartment
        .groupBy("departement.id")
        .orderBy(
          (eb) =>
            ownerId
              ? eb.fn.count("donnee.id").filterWhere("inventaire.ownerId", "=", ownerId)
              : eb.fn.count("donnee.id"),
          sortOrder ?? undefined,
        )
        .orderBy("departement.code asc");

      break;
    case "nbLieuxDits":
      queryDepartment = kysely
        .selectFrom("departement")
        .leftJoin("commune", "commune.departementId", "departement.id")
        .leftJoin("lieudit", "lieudit.communeId", "commune.id")
        .select([sql`basenaturaliste.departement.id::text`.as("id"), "departement.code", "departement.ownerId"]);

      if (q?.length) {
        queryDepartment = queryDepartment.where(sql`unaccent(departement.code)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      queryDepartment = queryDepartment
        .groupBy("departement.id")
        .orderBy((eb) => eb.fn.count("lieudit.id"), sortOrder ?? undefined)
        .orderBy("departement.code asc");

      break;
    case "nbCommunes":
      queryDepartment = kysely
        .selectFrom("departement")
        .leftJoin("commune", "commune.departementId", "departement.id")
        .select([sql`basenaturaliste.departement.id::text`.as("id"), "departement.code", "departement.ownerId"]);

      if (q?.length) {
        queryDepartment = queryDepartment.where(sql`unaccent(departement.code)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      queryDepartment = queryDepartment
        .groupBy("departement.id")
        .orderBy((eb) => eb.fn.count("commune.id"), sortOrder ?? undefined)
        .orderBy("departement.code asc");

      break;
    default:
      queryDepartment = kysely
        .selectFrom("departement")
        .select([sql`basenaturaliste.departement.id::text`.as("id"), "departement.code", "departement.ownerId"]);

      if (q?.length) {
        queryDepartment = queryDepartment.where(sql`unaccent(departement.code)`, "ilike", sql`unaccent(${`%${q}%`})`);
      }

      if (orderBy) {
        queryDepartment = queryDepartment.orderBy(orderBy, sortOrder ?? undefined);
      } else {
        if (q?.length) {
          // If no explicit order is requested and a query is provided, return the matches in the following order:
          // The ones for which code starts with query
          // Then the ones which code contains the query

          queryDepartment = queryDepartment
            .orderBy(sql`departement.code ~* ${`^${escapeStringRegexp(q)}`}`, "desc")
            .orderBy("departement.code asc");
        }

        // Then two groups are finally sorted alphabetically in any case
        queryDepartment = queryDepartment.orderBy("departement.code asc");
      }

      break;
  }

  if (offset) {
    queryDepartment = queryDepartment.offset(offset);
  }
  if (limit) {
    queryDepartment = queryDepartment.limit(limit);
  }

  const departmentsResult = await queryDepartment.execute();

  return z.array(departmentSchema).parse(departmentsResult);
};

const getCount = async (q?: string | null): Promise<number> => {
  let query = kysely.selectFrom("departement").select((eb) => eb.fn.countAll().as("count"));

  if (q?.length) {
    query = query.where(sql`unaccent(code)`, "ilike", sql`unaccent(${`%${q}%`})`);
  }

  const countResult = await query.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const getEntriesCountById = async (id: string, ownerId?: string): Promise<number> => {
  let countResultQuery = kysely
    .selectFrom("donnee")
    .leftJoin("inventaire", "inventaire.id", "donnee.inventaireId")
    .leftJoin("lieudit", "lieudit.id", "inventaire.lieuditId")
    .leftJoin("commune", "commune.id", "lieudit.communeId")
    .select((eb) => eb.fn.count("donnee.id").distinct().as("count"))
    .where("commune.departementId", "=", Number.parseInt(id));

  if (ownerId) {
    countResultQuery = countResultQuery.where("inventaire.ownerId", "=", ownerId);
  }

  const countResult = await countResultQuery.executeTakeFirstOrThrow();

  return countSchema.parse(countResult).count;
};

const createDepartment = async (
  departmentInput: DepartmentCreateInput,
): Promise<Result<Department, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .insertInto("departement")
      .values({
        code: departmentInput.code,
        ownerId: departmentInput.ownerId,
      })
      .returning([sql<string>`id::text`.as("id"), "code", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((createdDepartment) => departmentSchema.parse(createdDepartment));
};

const createDepartments = async (departmentInputs: DepartmentCreateInput[]): Promise<Department[]> => {
  const createdDepartments = await kysely
    .insertInto("departement")
    .values(
      departmentInputs.map((departmentInput) => {
        return {
          code: departmentInput.code,
          ownerId: departmentInput.ownerId,
        };
      }),
    )
    .returning([sql<string>`id::text`.as("id"), "code", "ownerId"])
    .execute();

  return z.array(departmentSchema).nonempty().parse(createdDepartments);
};

const updateDepartment = async (
  departmentId: number,
  departmentInput: DepartmentCreateInput,
): Promise<Result<Department, EntityFailureReason>> => {
  return fromPromise(
    kysely
      .updateTable("departement")
      .set({
        code: departmentInput.code,
        ownerId: departmentInput.ownerId,
      })
      .where("id", "=", departmentId)
      .returning([sql`id::text`.as("id"), "code", "ownerId"])
      .executeTakeFirstOrThrow(),
    handleDatabaseError,
  ).map((updatedDepartment) => departmentSchema.parse(updatedDepartment));
};

const deleteDepartmentById = async (departmentId: number): Promise<Department | null> => {
  const deletedDepartment = await kysely
    .deleteFrom("departement")
    .where("id", "=", departmentId)
    .returning([sql<string>`id::text`.as("id"), "code", "ownerId"])
    .executeTakeFirst();

  return deletedDepartment ? departmentSchema.parse(deletedDepartment) : null;
};

export const departmentRepository = {
  findDepartmentById,
  findDepartmentByTownId,
  findDepartments,
  getCount,
  getEntriesCountById,
  createDepartment,
  createDepartments,
  updateDepartment,
  deleteDepartmentById,
};
