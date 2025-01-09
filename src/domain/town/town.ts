import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type TownFailureReason = CommonFailureReason;

export const townSchema = z.object({
  id: z.string(),
  departmentId: z.string(),
  code: z.number(),
  nom: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Town = z.infer<typeof townSchema>;

export type TownFindManyInput = Partial<{
  q: string | null;
  departmentId?: string | null;
  orderBy: "id" | "code" | "nom" | "departement" | "nbDonnees" | "nbLieuxDits" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type TownCreateInput = {
  departmentId: string;
  code: number;
  nom: string;
  ownerId?: string | null;
};
