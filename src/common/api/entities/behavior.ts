import { BREEDER_CODES } from "@domain/behavior/breeder.js";
import { z } from "zod";
import "zod-openapi/extend";

export const behaviorSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    libelle: z.string(),
    nicheur: z.enum(BREEDER_CODES).nullable(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({ ref: "Behavior" });
