import { z } from "zod";
import { getPaginatedResponseSchema } from "../../application/http/controllers/common/pagination.js";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";
import { weatherSchema } from "./entities/weather.js";

/**
 * `GET` `/weather/:id`
 *  Retrieve weather entity
 */
export const getWeatherResponse = weatherSchema;

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

export const getWeathersResponse = getPaginatedResponseSchema(weatherSchema);

/**
 * `PUT` `/weather/:id` Update of weather entity
 * `POST` `/weather` Create new weather entity
 */
export const upsertWeatherInput = z.object({
  libelle: z.string().trim().min(1),
});

export type UpsertWeatherInput = z.infer<typeof upsertWeatherInput>;

export const upsertWeatherResponse = weatherSchema;
