import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/sexes/:id/info`
 *  Retrieve sex info
 */
export const sexInfoSchema = entityInfoSchema;

/**
 * `GET` `/sexes`
 *  Retrieve paginated sexes results
 */
export const getSexesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type SexesSearchParams = z.infer<typeof getSexesQueryParamsSchema>;

/**
 * `PUT` `/sex/:id` Update of sex entity
 * `POST` `/sex` Create new sex entity
 */
export const upsertSexInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertSexInput = z.infer<typeof upsertSexInput>;
