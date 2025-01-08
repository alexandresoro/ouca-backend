import type { Inventory } from "@ou-ca/api/models";

export const getInventaireCoordinates = (
  inventaire: Inventory,
): { latitude: number; longitude: number; altitude: number } => {
  // Customized coordinates are defined
  if (inventaire.customizedCoordinates?.longitude != null) {
    return {
      latitude: inventaire.customizedCoordinates.latitude,
      longitude: inventaire.customizedCoordinates.longitude,
      altitude: inventaire.customizedCoordinates.altitude,
    };
  }

  // Default lieu-dit coordinates are used
  return {
    latitude: inventaire.locality.coordinates.latitude,
    longitude: inventaire.locality.coordinates.longitude,
    altitude: inventaire.locality.coordinates.altitude,
  };
};
