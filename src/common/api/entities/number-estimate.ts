import { z } from "zod";
import "zod-openapi/extend";

export const numberEstimateSchema = z
  .object({
    id: z.string(),
    libelle: z.string(),
    nonCompte: z.boolean(),
    ownerId: z.string().uuid().nullable(),
  })
  .openapi({
    ref: "NumberEstimate",
  });
