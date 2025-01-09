import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";
import { BREEDER_CODES, type BreederCode } from "./breeder.js";

export type BehaviorFailureReason = CommonFailureReason;

export const behaviorSchema = z.object({
  id: z.string(),
  code: z.string(),
  libelle: z.string(),
  nicheur: z.enum(BREEDER_CODES).nullable(),
  ownerId: z.string().uuid().nullable(),
});

export type Behavior = z.infer<typeof behaviorSchema>;

export type BehaviorFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "code" | "libelle" | "nicheur" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type BehaviorCreateInput = {
  code: string;
  libelle: string;
  nicheur?: BreederCode | null;
  ownerId?: string | null;
};
