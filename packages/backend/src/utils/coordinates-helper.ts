import type { Locality } from "@ou-ca/common/api/entities/locality";

export const areCoordinatesCustom = (
  locality: Locality,
  altitude: number,
  longitude: number,
  latitude: number,
): boolean => {
  return (
    locality.coordinates.altitude !== altitude ||
    locality.coordinates.longitude !== longitude ||
    locality.coordinates.latitude !== latitude
  );
};
