import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type SpeciesClassFailureReason = CommonFailureReason;

export const speciesClassSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type SpeciesClass = z.infer<typeof speciesClassSchema>;

export type SpeciesClassFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbEspeces" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type SpeciesClassCreateInput = {
  libelle: string;
  ownerId?: string | null;
};
