import { z } from "zod";
import { NICHEUR_CODES } from "../../types/nicheur.model.js";

export const behaviorSchema = z.object({
  id: z.string(),
  code: z.string(),
  libelle: z.string(),
  nicheur: z.enum(NICHEUR_CODES).nullable(),
  ownerId: z.string().uuid().nullable(),
});

export type Behavior = z.infer<typeof behaviorSchema>;
