import { z } from "zod";
import "zod-openapi/extend";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/observers/:id/info`
 *  Retrieve observer info
 */
export const observerInfoSchema = entityInfoSchema;

/**
 * `GET` `/observers`
 *  Retrieve paginated observers results
 */
export const getObserversQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type ObserversSearchParams = z.infer<typeof getObserversQueryParamsSchema>;

/**
 * `PUT` `/observer/:id` Update of observer entity
 * `POST` `/observer` Create new observer entity
 */
export const upsertObserverInput = z
  .object({
    libelle: z.string().trim().min(1),
  })
  .openapi({
    ref: "UpsertObserverInput",
  });

export type UpsertObserverInput = z.infer<typeof upsertObserverInput>;
