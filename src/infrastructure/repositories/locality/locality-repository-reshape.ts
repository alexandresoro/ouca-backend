import type { GeoJSONLocality } from "@domain/locality/locality-geojson.js";
import type { Locality } from "@domain/locality/locality.js";
import type { Locality as LocalityRepository } from "@infrastructure/kysely/database/Locality.js";

type RawLocality = Omit<LocalityRepository, "id" | "communeId" | "coordinatesSystem"> & {
  id: string;
  communeId: string;
};

export const reshapeRawLocality = (rawLocality: RawLocality): Locality => {
  const { communeId, ...restRawLocality } = rawLocality;

  return {
    ...restRawLocality,
    townId: communeId,
  };
};

export const reshapeRawLocalityWithTownAndDepartment = (
  rawLocality: RawLocality & { townCode: number | null; townName: string | null; departmentCode: string | null },
) => {
  const { communeId, ...restRawLocality } = rawLocality;

  return {
    ...restRawLocality,
    townId: communeId,
  };
};

export const reshapeRawLocalityForGeoJson = (
  rawLocality: RawLocality & { townName: string | null; departmentId: string; departmentCode: string | null },
): Omit<GeoJSONLocality, "townName" | "departmentCode"> & {
  townName: string | null;
  departmentCode: string | null;
} => {
  const { communeId, ...restRawLocality } = rawLocality;

  return {
    ...restRawLocality,
    townId: communeId,
  };
};
