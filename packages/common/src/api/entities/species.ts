import { z } from "zod";
import { speciesClassSchema } from "./species-class.js";

export const speciesSchema = z.object({
  id: z.string(),
  code: z.string(),
  nomFrancais: z.string(),
  nomLatin: z.string(),
  classId: z.string().nullable(), // FIXME: field is nullable in DB
  speciesClass: speciesClassSchema.nullable(),
  ownerId: z.string().uuid().nullable(),
});

export type Species = z.infer<typeof speciesSchema>;
