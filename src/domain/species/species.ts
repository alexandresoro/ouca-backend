import { z } from "zod";
import type { SearchCriteria } from "../search/search-criteria.js";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type SpeciesFailureReason = CommonFailureReason;

export const speciesSchema = z.object({
  id: z.string(),
  classId: z.string().nullable(),
  code: z.string(),
  nomFrancais: z.string(),
  nomLatin: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Species = z.infer<typeof speciesSchema>;

export type SpeciesFindManyInput = Partial<{
  q: string | null | undefined;
  searchCriteria: SearchCriteria | null | undefined;
  orderBy: "id" | "code" | "nomClasse" | "nomFrancais" | "nomLatin" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type SpeciesCreateInput = {
  classId: string;
  code: string;
  nomFrancais: string;
  nomLatin: string;
  ownerId?: string | null;
};
