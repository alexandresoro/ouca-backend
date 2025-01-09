import type { Locality } from "@domain/locality/locality.js";
import type { Locality as LocalityCommon } from "@ou-ca/common/api/entities/locality.js";

export function reshapeLocalityRepositoryToApi(locality: Locality): LocalityCommon;
export function reshapeLocalityRepositoryToApi(locality: null): null;
export function reshapeLocalityRepositoryToApi(locality: Locality | null): LocalityCommon | null;
export function reshapeLocalityRepositoryToApi(locality: Locality | null): LocalityCommon | null {
  if (!locality) {
    return null;
  }

  const { altitude, latitude, longitude, ...restLocality } = locality;
  return {
    ...restLocality,
    coordinates: {
      altitude,
      latitude,
      longitude,
    },
  };
}
