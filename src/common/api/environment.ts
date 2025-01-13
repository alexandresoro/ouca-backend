import { z } from "zod";
import { getPaginatedResponseSchema } from "../../application/http/controllers/common/pagination.js";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { environmentSchema } from "./entities/environment.js";

/**
 * `GET` `/environment/:id`
 *  Retrieve environment entity
 */
export const getEnvironmentResponse = environmentSchema;

/**
 * `GET` `/environments/:id/info`
 *  Retrieve environment info
 */
export const environmentInfoSchema = entityInfoSchema;

/**
 * `GET` `/environments`
 *  Retrieve paginated environments results
 */
export const ENVIRONMENTS_ORDER_BY_ELEMENTS = [...ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS, "code"] as const;

export const getEnvironmentsQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENVIRONMENTS_ORDER_BY_ELEMENTS).optional(),
});

export type EnvironmentsSearchParams = z.infer<typeof getEnvironmentsQueryParamsSchema>;

export const getEnvironmentsResponse = getPaginatedResponseSchema(environmentSchema);

/**
 * `PUT` `/environment/:id` Update of environment entity
 * `POST` `/environment` Create new environment entity
 */
export const upsertEnvironmentInput = z.object({
  code: z.string().trim().min(1),
  libelle: z.string().trim().min(1),
});

export type UpsertEnvironmentInput = z.infer<typeof upsertEnvironmentInput>;

export const upsertEnvironmentResponse = environmentSchema;
