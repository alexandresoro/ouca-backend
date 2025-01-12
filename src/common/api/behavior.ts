import { BREEDER_CODES } from "@domain/behavior/breeder.js";
import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { behaviorSchema } from "./entities/behavior.js";

/**
 * `GET` `/behavior/:id`
 *  Retrieve behavior entity
 */
export const getBehaviorResponse = behaviorSchema;

export type GetBehaviorResponse = z.infer<typeof getBehaviorResponse>;

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
export type BehaviorsOrderBy = (typeof BEHAVIORS_ORDER_BY_ELEMENTS)[number];

export const getBehaviorsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(BEHAVIORS_ORDER_BY_ELEMENTS).optional(),
});

export type BehaviorsSearchParams = z.infer<typeof getBehaviorsQueryParamsSchema>;

export const getBehaviorsResponse = getPaginatedResponseSchema(behaviorSchema);

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

export const upsertBehaviorResponse = behaviorSchema;

export type UpsertBehaviorResponse = z.infer<typeof upsertBehaviorResponse>;
