import { z } from "zod";

/**
 * `GET` `/altitude`
 *  Retrieve altitude for a given latitude and longitude
 */
export const getAltitudeQueryParamsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const getAltitudeResponse = z.object({
  altitude: z.number(),
});
