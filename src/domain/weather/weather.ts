import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type WeatherFailureReason = CommonFailureReason;

export const weatherSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Weather = z.infer<typeof weatherSchema>;

export type WeatherFindManyInput = Partial<{
  q: string | null;
  orderBy: "id" | "libelle" | "nbDonnees" | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type WeatherCreateInput = {
  libelle: string;
  ownerId?: string | null;
};
