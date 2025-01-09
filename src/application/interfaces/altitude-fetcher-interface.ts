import type { AltitudeResult, ProviderFailureReason } from "@domain/altitude/altitude.js";
import type { Result } from "neverthrow";

export type AltitudeFetcher = {
  getAltitude: ({
    latitude,
    longitude,
  }: { latitude: number; longitude: number }) => Promise<Result<AltitudeResult, ProviderFailureReason>>;
};
