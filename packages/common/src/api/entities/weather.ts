import { z } from "zod";

export const weatherSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  ownerId: z.string().uuid().nullable(),
});

export type Weather = z.infer<typeof weatherSchema>;
