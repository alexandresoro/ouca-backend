import type { InventoryCreateInput } from "@domain/inventory/inventory.js";
import type { Locality } from "@domain/locality/locality.js";
import type { UpsertInventoryInput } from "@ou-ca/common/api/inventory.js";
import { getHumanFriendlyTimeFromMinutes } from "../../../utils/time-format-convert.js";

export const reshapeInputInventoryUpsertData = (
  inventory: UpsertInventoryInput,
  locality: Locality,
  ownerId?: string | null,
): InventoryCreateInput => {
  const { duration, migrateDonneesIfMatchesExistingInventaire, coordinates, ...rest } = inventory;

  let customizedCoordinates: InventoryCreateInput["customizedCoordinates"];
  // Check that coordinates are provided and should be used
  if (
    coordinates &&
    (coordinates.latitude !== locality.latitude ||
      coordinates.longitude !== locality.longitude ||
      coordinates.altitude !== locality.altitude)
  ) {
    customizedCoordinates = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      altitude: coordinates.altitude,
    };
  } else {
    customizedCoordinates = null;
  }

  return {
    ...rest,
    duration: duration != null ? getHumanFriendlyTimeFromMinutes(duration) : null,
    customizedCoordinates,
    ...(ownerId ? { ownerId } : {}),
  };
};
