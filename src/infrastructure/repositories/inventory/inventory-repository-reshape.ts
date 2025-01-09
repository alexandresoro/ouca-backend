import type { Inventory } from "@domain/inventory/inventory.js";
import type { Inventory as InventoryRepository } from "@infrastructure/kysely/database/Inventory.js";

type RawInventory = Omit<InventoryRepository, "observateurId" | "lieuditId"> & {
  observateurId: string;
  lieuditId: string;
} & {
  associateIds: string[];
  weatherIds: string[];
};

export const reshapeRawInventory = (rawInventory: RawInventory): Inventory => {
  const { observateurId, lieuditId, heure, duree, altitude, latitude, longitude, dateCreation, ...restRawLocality } =
    rawInventory;

  return {
    ...restRawLocality,
    observerId: observateurId,
    localityId: lieuditId,
    time: heure,
    duration: duree,
    customizedCoordinates:
      altitude != null && latitude != null && longitude != null
        ? {
            altitude,
            latitude,
            longitude,
          }
        : null,
    creationDate: dateCreation,
  };
};
