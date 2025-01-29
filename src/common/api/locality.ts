import { z } from "zod";
import "zod-openapi/extend";
import { entitiesCommonQueryParamsSchema } from "./common/entitiesSearchParams.js";
import { entityInfoSchema } from "./common/entity-info.js";

/**
 * `GET` `/locality/:id/info`
 *  Retrieve locality info
 */
export const localityInfoSchema = entityInfoSchema.extend({
  townCode: z.number(),
  townName: z.string(),
  departmentCode: z.string(),
});

/**
 * `GET` `/localities`
 *  Retrieve paginated localities results
 */
export const LOCALITIES_ORDER_BY_ELEMENTS = [
  "id",
  "nom",
  "altitude",
  "longitude",
  "latitude",
  "codeCommune",
  "nomCommune",
  "departement",
  "nbDonnees",
] as const;

export const getLocalitiesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(LOCALITIES_ORDER_BY_ELEMENTS).optional(),
  townId: z.string().optional(),
});

export type LocalitiesSearchParams = z.infer<typeof getLocalitiesQueryParamsSchema>;

/**
 * `PUT` `/locality/:id` Update of locality entity
 * `POST` `/locality` Create new locality entity
 */
export const upsertLocalityInput = z
  .object({
    townId: z.string().trim().min(1),
    nom: z.string().trim().min(1),
    altitude: z.number().int().min(-1000).max(9000),
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
  })
  .openapi({
    ref: "UpsertLocalityInput",
  });

export type UpsertLocalityInput = z.infer<typeof upsertLocalityInput>;
