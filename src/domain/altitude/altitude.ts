import { z } from "zod";
import type { CommonFailureReason } from "../shared/failure-reason.js";

export type ProviderFailureReason = "fetchError" | "parseError" | "coordinatesNotSupported";

export type AltitudeFailureReason = CommonFailureReason | ProviderFailureReason;

export const altitudeResultSchema = z.object({
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  altitude: z.number(),
});

export type AltitudeResult = z.infer<typeof altitudeResultSchema>;
