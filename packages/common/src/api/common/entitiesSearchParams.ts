import { z } from "zod";
import { paginationQueryParamsSchema } from "./pagination.js";

export const ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS = ["id", "libelle", "nbDonnees"] as const;

const sortOrder = ["asc", "desc"] as const;

export type SortOrder = (typeof sortOrder)[number];

export const entitiesCommonQueryParamsSchema = paginationQueryParamsSchema.extend({
  q: z.string().optional(),
  sortOrder: z.enum(sortOrder).optional(),
});
