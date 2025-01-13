import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/number-estimates/:id/info`
 *  Retrieve number estimate info
 */
export const numberEstimateInfoSchema = entityInfoSchema;

/**
 * `GET` `/number-estimates`
 *  Retrieve paginated number estimates results
 */
export const NUMBER_ESTIMATES_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "nonCompte"] as const;

export const getNumberEstimatesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(NUMBER_ESTIMATES_ORDER_BY_ELEMENTS).optional(),
});

export type NumberEstimatesSearchParams = z.infer<typeof getNumberEstimatesQueryParamsSchema>;

/**
 * `PUT` `/number-estimate/:id` Update of number estimate entity
 * `POST` `/number-estimate` Create new number estimate entity
 */
export const upsertNumberEstimateInput = z.object({
  libelle: z.string().trim().min(1),
  nonCompte: z.boolean(),
});

export type UpsertNumberEstimateInput = z.infer<typeof upsertNumberEstimateInput>;
