import { z } from "zod";

export const sexSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Sex = z.infer<typeof sexSchema>;
