import { z } from "zod";

export const speciesClassSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type SpeciesClass = z.infer<typeof speciesClassSchema>;
