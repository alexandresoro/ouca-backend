import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type NumberEstimateFailureReason = CommonFailureReason;

export const numberEstimateSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  nonCompte: z.boolean(),
  ownerId: z.string().uuid().nullable(),
});

export type NumberEstimate = z.infer<typeof numberEstimateSchema>;

export type NumberEstimateFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nonCompte" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type NumberEstimateCreateInput = {
  libelle: string;
  nonCompte: boolean;
  ownerId?: string | null;
};
