import type { AltitudeFetcher } from "@interfaces/altitude-fetcher-interface.js";

type AltitudeServiceDependencies = {
  altitudeFetcher: AltitudeFetcher;
};

export const buildAltitudeService = ({ altitudeFetcher }: AltitudeServiceDependencies) => {
  const getAltitude = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    return altitudeFetcher.getAltitude({ latitude, longitude });
  };

  return {
    getAltitude,
  };
};

export type AltitudeService = ReturnType<typeof buildAltitudeService>;
