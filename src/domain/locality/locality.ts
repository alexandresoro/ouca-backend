import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";
import type { SortOrder } from "../shared/sort-order.js";

export type LocalityFailureReason = CommonFailureReason;

export const localitySchema = z.object({
  id: z.string(),
  townId: z.string(),
  nom: z.string(),
  altitude: z.number(),
  longitude: z.number(),
  latitude: z.number(),
  ownerId: z.string().uuid().nullable(),
});

export type Locality = z.infer<typeof localitySchema>;

export type LocalityFindManyInput = Partial<{
  q: string | null;
  townId?: string | null;
  orderBy:
    | "id"
    | "nom"
    | "altitude"
    | "latitude"
    | "longitude"
    | "codeCommune"
    | "nomCommune"
    | "departement"
    | "nbDonnees"
    | null;
  sortOrder: SortOrder;
  offset: number | null;
  limit: number | null;
}>;

export type LocalityCreateInput = {
  townId: string;
  nom: string;
  altitude: number;
  latitude: number;
  longitude: number;
  ownerId?: string | null;
};
