import { z } from "zod";
import "zod-openapi/extend";

export const townSchema = z
  .object({
    id: z.string(),
    code: z.number(),
    nom: z.string(),
    departmentId: z.string(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({
    ref: "Town",
  });
