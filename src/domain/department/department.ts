import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type DepartmentFailureReason = CommonFailureReason;

export const departmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Department = z.infer<typeof departmentSchema>;

export type DepartmentFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "code" | "nbDonnees" | "nbCommunes" | "nbLieuxDits" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type DepartmentCreateInput = {
  code: string;
  ownerId?: string | null;
};
