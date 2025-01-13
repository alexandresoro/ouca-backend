import { z } from "zod";

export const environmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});
