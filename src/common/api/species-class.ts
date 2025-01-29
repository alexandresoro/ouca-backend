import { z } from "zod";
import "zod-openapi/extend";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/classes/:id/info`
 *  Retrieve species class info
 */
export const speciesClassInfoSchema = entityInfoSchema.extend({
  speciesCount: z.number(),
});

/**
 * `GET` `/classes`
 *  Retrieve paginated classes results
 */
export const CLASSES_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "nbEspeces"] as const;

export const getClassesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(CLASSES_ORDER_BY_ELEMENTS).optional(),
});

export type ClassesSearchParams = z.infer<typeof getClassesQueryParamsSchema>;

/**
 * `PUT` `/class/:id` Update of class entity
 * `POST` `/class` Create new class entity
 */
export const upsertClassInput = z
  .object({
    libelle: z.string().trim().min(1),
  })
  .openapi({
    ref: "UpsertSpeciesClassInput",
  });

export type UpsertClassInput = z.infer<typeof upsertClassInput>;
