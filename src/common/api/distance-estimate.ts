import { z } from "zod";
import "zod-openapi/extend";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/distance-estimates/:id/info`
 *  Retrieve distance estimate info
 */
export const distanceEstimateInfoSchema = entityInfoSchema;

/**
 * `GET` `/distance-estimates`
 *  Retrieve paginated distance estimates results
 */
export const getDistanceEstimatesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type DistanceEstimatesSearchParams = z.infer<typeof getDistanceEstimatesQueryParamsSchema>;

/**
 * `PUT` `/distance-estimate/:id` Update of distance estimate entity
 * `POST` `/distance-estimate` Create new distance estimate entity
 */
export const upsertDistanceEstimateInput = z
  .object({
    libelle: z.string().trim().min(1),
  })
  .openapi({
    ref: "UpsertDistanceEstimateInput",
  });

export type UpsertDistanceEstimateInput = z.infer<typeof upsertDistanceEstimateInput>;
