import { z } from "zod";
import "zod-openapi/extend";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/department/:id/info`
 *  Retrieve department info
 */
export const departmentInfoSchema = entityInfoSchema.extend({
  localitiesCount: z.number(),
  townsCount: z.number(),
});

/**
 * `GET` `/departments`
 *  Retrieve paginated departments results
 */
export const DEPARTMENTS_ORDER_BY_ELEMENTS = ["id", "code", "nbCommunes", "nbLieuxDits", "nbDonnees"] as const;

export const getDepartmentsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(DEPARTMENTS_ORDER_BY_ELEMENTS).optional(),
});

export type DepartmentsSearchParams = z.infer<typeof getDepartmentsQueryParamsSchema>;

/**
 * `PUT` `/department/:id` Update of department entity
 * `POST` `/department` Create new department entity
 */
export const upsertDepartmentInput = z
  .object({
    code: z.string().trim().min(1),
  })
  .openapi({
    ref: "UpsertDepartmentInput",
  });

export type UpsertDepartmentInput = z.infer<typeof upsertDepartmentInput>;
