import { z } from "zod";
import "zod-openapi/extend";

export const environmentSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    libelle: z.string(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({
    ref: "Environment",
  });
