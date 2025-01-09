import { z } from "zod";

export const distanceEstimateSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type DistanceEstimate = z.infer<typeof distanceEstimateSchema>;
