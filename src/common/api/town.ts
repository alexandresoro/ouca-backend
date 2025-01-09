import { z } from "zod";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { townSchema } from "./entities/town.js";

/**
 * `GET` `/town/:id`
 *  Retrieve town entity
 */
export const getTownResponse = townSchema;

export type GetTownResponse = z.infer<typeof getTownResponse>;

/**
 * `GET` `/towns/:id/info`
 *  Retrieve town info
 */
export const townInfoSchema = entityInfoSchema.extend({
  departmentCode: z.string(),
  localitiesCount: z.number(),
});

/**
 * `GET` `/towns`
 *  Retrieve paginated towns results
 */
export const TOWNS_ORDER_BY_ELEMENTS = ["id", "code", "nom", "departement", "nbLieuxDits", "nbDonnees"] as const;
export type TownsOrderBy = (typeof TOWNS_ORDER_BY_ELEMENTS)[number];

export const getTownsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(TOWNS_ORDER_BY_ELEMENTS).optional(),
  departmentId: z.string().optional(),
});

export type TownsSearchParams = z.infer<typeof getTownsQueryParamsSchema>;

export const getTownsResponse = getPaginatedResponseSchema(townSchema);

/**
 * `PUT` `/town/:id` Update of town entity
 * `POST` `/town` Create new town entity
 */
export const upsertTownInput = z.object({
  code: z.coerce.number().int().min(1),
  nom: z.string().trim().min(1),
  departmentId: z.string().trim().min(1),
});

export type UpsertTownInput = z.infer<typeof upsertTownInput>;

export const upsertTownResponse = townSchema;

export type UpsertTownResponse = z.infer<typeof upsertTownResponse>;
