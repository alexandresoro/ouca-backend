import { z } from "zod";

export const townSchema = z.object({
  id: z.string(),
  code: z.number(),
  nom: z.string(),
  departmentId: z.string(),
  ownerId: z.string().uuid().nullable(),
});
