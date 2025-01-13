import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { observerSchema } from "./entities/observer.js";

/**
 * `GET` `/observer/:id`
 *  Retrieve observer entity
 */
export const getObserverResponse = observerSchema;

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

export const getObserversResponse = getPaginatedResponseSchema(observerSchema);

/**
 * `PUT` `/observer/:id` Update of observer entity
 * `POST` `/observer` Create new observer entity
 */
export const upsertObserverInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertObserverInput = z.infer<typeof upsertObserverInput>;

export const upsertObserverResponse = observerSchema;
