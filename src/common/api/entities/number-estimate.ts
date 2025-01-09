import { z } from "zod";

export const numberEstimateSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  nonCompte: z.boolean(),
  ownerId: z.string().uuid().nullable(),
});

export type NumberEstimate = z.infer<typeof numberEstimateSchema>;
