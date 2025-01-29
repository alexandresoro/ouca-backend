import { z } from "zod";
import "zod-openapi/extend";
import { speciesClassSchema } from "./species-class.js";

export const speciesSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    nomFrancais: z.string(),
    nomLatin: z.string(),
    classId: z.string().nullable(), // FIXME: field is nullable in DB
    speciesClass: speciesClassSchema.nullable(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({ ref: "Species" });

export type Species = z.infer<typeof speciesSchema>;
