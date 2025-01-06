import { z } from "zod";

export const coordinatesSchema = z.object({
  altitude: z.number().int().min(-1000).max(9000),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});

export type Coordinates = z.infer<typeof coordinatesSchema>;
