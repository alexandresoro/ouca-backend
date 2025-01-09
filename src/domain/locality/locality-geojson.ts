import { z } from "zod";

export const geoJSONLocalitySchema = z.object({
  id: z.string(),
  nom: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  townId: z.string(),
  townName: z.string(),
  departmentId: z.string(),
  departmentCode: z.string(),
});

export type GeoJSONLocality = z.infer<typeof geoJSONLocalitySchema>;
