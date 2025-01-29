import { z } from "zod";
import "zod-openapi/extend";
import { coordinatesSchema } from "./coordinates.js";

export const localitySchema = z
  .object({
    id: z.string(),
    nom: z.string(),
    coordinates: coordinatesSchema,
    townId: z.string(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({
    ref: "Locality",
  });

export type Locality = z.infer<typeof localitySchema>;
