import { BREEDER_CODES } from "@domain/behavior/breeder.js";
import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/behavior/:id/info`
 *  Retrieve behavior info
 */
export const behaviorInfoSchema = entityInfoSchema;

/**
 * `GET` `/behaviors`
 *  Retrieve paginated behaviors results
 */
export const BEHAVIORS_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "code", "nicheur"] as const;

export const getBehaviorsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(BEHAVIORS_ORDER_BY_ELEMENTS).optional(),
});

export type BehaviorsSearchParams = z.infer<typeof getBehaviorsQueryParamsSchema>;

/**
 * `PUT` `/behavior/:id` Update of behavior entity
 * `POST` `/behavior` Create new behavior entity
 */
export const upsertBehaviorInput = z.object({
  code: z.string().trim().min(1),
  libelle: z.string().trim().min(1),
  nicheur: z.enum(BREEDER_CODES).nullable(),
});

export type UpsertBehaviorInput = z.infer<typeof upsertBehaviorInput>;
