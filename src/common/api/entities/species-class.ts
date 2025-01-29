import { z } from "zod";
import "zod-openapi/extend";

export const speciesClassSchema = z
  .object({
    id: z.string(),
    libelle: z.string(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({
    ref: "SpeciesClass",
  });
