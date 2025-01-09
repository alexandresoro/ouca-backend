import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type ObserverFailureReason = CommonFailureReason;

export const observerSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Observer = z.infer<typeof observerSchema>;

export type ObserverFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type ObserverCreateInput = {
  libelle: string;
  ownerId?: string | null;
};
