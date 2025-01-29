import { z } from "zod";
import "zod-openapi/extend";

export const coordinatesSchema = z
  .object({
    altitude: z.number().int().min(-1000).max(9000),
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
  })
  .openapi({
    ref: "Coordinates",
  });
