import { z } from "zod";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/weathers/:id/info`
 *  Retrieve weather info
 */
export const weatherInfoSchema = entityInfoSchema;

/**
 * `GET` `/weathers`
 *  Retrieve paginated weathers results
 */
export const getWeathersQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export type WeathersSearchParams = z.infer<typeof getWeathersQueryParamsSchema>;

/**
 * `PUT` `/weather/:id` Update of weather entity
 * `POST` `/weather` Create new weather entity
 */
export const upsertWeatherInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertWeatherInput = z.infer<typeof upsertWeatherInput>;
