import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { getPaginatedResponseSchema } from "./common/pagination.js";
import { ageSchema } from "./entities/age.js";

/**
 * `GET` `/age/:id`
 *  Retrieve age entity
 */
export const getAgeResponse = ageSchema;

/**
 * `GET` `/ages/:id/info`
 *  Retrieve age info
 */
export const ageInfoSchema = entityInfoSchema;

/**
 * `GET` `/ages`
 *  Retrieve paginated ages results
 */
export const getAgesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type AgesSearchParams = z.infer<typeof getAgesQueryParamsSchema>;

export const getAgesResponse = getPaginatedResponseSchema(ageSchema);

/**
 * `PUT` `/age/:id` Update of age entity
 * `POST` `/age` Create new age entity
 */
export const upsertAgeInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertAgeInput = z.infer<typeof upsertAgeInput>;

export const upsertAgeResponse = ageSchema;
