import type { Inventory, Locality } from "@ou-ca/api/models";
import { getAltitudeToDisplay } from "@services/altitude/altitude-service";
import { apiUrlAtom } from "@services/api/api-url-atom";
import { oidcUserAtom } from "@services/auth/oidc-config";
import type { Coordinates, CoordinatesWithAltitude } from "@typings/Coordinates";
import { atom } from "jotai";
import { RESET, atomWithReset } from "jotai/utils";

// The current coordinates
const inventoryLatitudeInternal = atomWithReset<number | null>(null);
export const inventoryLatitudeAtom = atom(
  (get) => {
    return get(inventoryLatitudeInternal);
  },
  async (get, set, newLatitude: number | null | typeof RESET) => {
    // Round to 6 digits as this is what is supported on backend side
    const roundedLatitude = newLatitude !== RESET && newLatitude != null ? +newLatitude.toFixed(6) : newLatitude;

    // Update altitude
    if (roundedLatitude != null && roundedLatitude !== RESET) {
      const longitude = get(inventoryLongitudeAtom);

      const localityCoordinates = get(inventoryLocalityAtom)?.coordinates;
      const customizedCoordinates = get(storedCustomizedCoordinatesAtom);

      const apiUrl = get(apiUrlAtom);
      const token = get(oidcUserAtom)?.access_token;

      if (longitude != null && localityCoordinates != null && token != null) {
        const altitudeResult = await getAltitudeToDisplay(
          {
            latitude: roundedLatitude,
            longitude,
          },
          {
            lat: localityCoordinates.latitude,
            lng: localityCoordinates.longitude,
            altitude: localityCoordinates.altitude,
          },
          customizedCoordinates,
          {
            apiUrl,
            token,
          },
        );
        if (altitudeResult.outcome === "success") {
          set(inventoryAltitudeAtom, altitudeResult.altitude);
        } else if (altitudeResult.reason === "unsupportedCoordinates") {
          set(inventoryAltitudeAtom, null);
        }
      }
    }
    set(inventoryLatitudeInternal, roundedLatitude);
  },
);

export const inventoryLongitudeInternal = atomWithReset<number | null>(null);
export const inventoryLongitudeAtom = atom(
  (get) => {
    return get(inventoryLongitudeInternal);
  },
  async (get, set, newLongitude: number | null | typeof RESET) => {
    // Round to 6 digits as this is what is supported on backend side
    const roundedLongitude = newLongitude !== RESET && newLongitude != null ? +newLongitude.toFixed(6) : newLongitude;

    // Update altitude
    if (roundedLongitude != null && roundedLongitude !== RESET) {
      const latitude = get(inventoryLatitudeAtom);

      const localityCoordinates = get(inventoryLocalityAtom)?.coordinates;
      const customizedCoordinates = get(storedCustomizedCoordinatesAtom);

      const apiUrl = get(apiUrlAtom);
      const token = get(oidcUserAtom)?.access_token;
      if (latitude != null && localityCoordinates != null && token != null) {
        const altitudeResult = await getAltitudeToDisplay(
          {
            latitude,
            longitude: roundedLongitude,
          },
          {
            lat: localityCoordinates.latitude,
            lng: localityCoordinates.longitude,
            altitude: localityCoordinates.altitude,
          },
          customizedCoordinates,
          {
            apiUrl,
            token,
          },
        );
        if (altitudeResult.outcome === "success") {
          set(inventoryAltitudeAtom, altitudeResult.altitude);
        } else if (altitudeResult.reason === "unsupportedCoordinates") {
          set(inventoryAltitudeAtom, null);
        }
      }
    }
    set(inventoryLongitudeInternal, roundedLongitude);
  },
);

export const inventoryAltitudeAtom = atomWithReset<number | null>(null);

// The stored custom coordinates, if any
export const storedCustomizedCoordinatesAtom = atomWithReset<CoordinatesWithAltitude | null>(null);

export const inventoryCoordinatesAtom = atom(
  (get) => {
    const lat = get(inventoryLatitudeAtom);
    const lng = get(inventoryLongitudeAtom);
    if (lat != null && lng != null) {
      return {
        lat,
        lng,
      };
    }
    return undefined;
  },
  async (get, set, newCoordinates: Coordinates | typeof RESET) => {
    // Round to 6 digits as this is what is supported on backend side
    const roundedCoordinates =
      newCoordinates !== RESET
        ? ({
            lat: +newCoordinates.lat.toFixed(6),
            lng: +newCoordinates.lng.toFixed(6),
          } satisfies Coordinates)
        : newCoordinates;

    set(inventoryLatitudeInternal, roundedCoordinates === RESET ? roundedCoordinates : roundedCoordinates.lat);
    set(inventoryLongitudeInternal, roundedCoordinates === RESET ? roundedCoordinates : roundedCoordinates.lng);

    // Update altitude
    if (roundedCoordinates !== RESET) {
      const localityCoordinates = get(inventoryLocalityAtom)?.coordinates;
      const customizedCoordinates = get(storedCustomizedCoordinatesAtom);

      const apiUrl = get(apiUrlAtom);
      const token = get(oidcUserAtom)?.access_token;
      if (localityCoordinates != null && token != null) {
        const altitudeResult = await getAltitudeToDisplay(
          {
            latitude: roundedCoordinates.lat,
            longitude: roundedCoordinates.lng,
          },
          {
            lat: localityCoordinates.latitude,
            lng: localityCoordinates.longitude,
            altitude: localityCoordinates.altitude,
          },
          customizedCoordinates,
          {
            apiUrl,
            token,
          },
        );
        if (altitudeResult.outcome === "success") {
          set(inventoryAltitudeAtom, altitudeResult.altitude);
        } else if (altitudeResult.reason === "unsupportedCoordinates") {
          set(inventoryAltitudeAtom, null);
        }
      }
    }
  },
);

const inventoryCoordinatesWithAltitudeSetAtom = atom(
  null,
  async (_get, set, newCoordinates: CoordinatesWithAltitude | typeof RESET) => {
    await set(inventoryCoordinatesAtom, newCoordinates);
    set(inventoryAltitudeAtom, newCoordinates === RESET ? newCoordinates : newCoordinates.altitude);
  },
);

// To make sure that when the locality is set/reset, the coordinates are also set/reset
const inventoryLocalityInternal = atomWithReset<Locality | null>(null);
export const inventoryLocalityAtom = atom(
  (get) => {
    return get(inventoryLocalityInternal);
  },
  async (get, set, newValue: Locality | null | typeof RESET) => {
    const currentLocality = get(inventoryLocalityInternal);
    set(inventoryLocalityInternal, newValue);
    if (newValue === RESET || newValue === null) {
      await set(inventoryCoordinatesWithAltitudeSetAtom, RESET);
    } else if (newValue?.id !== currentLocality?.id) {
      // Update the coordinates
      // It is necessary only if the locality is updated
      const coordinates = {
        lat: newValue.coordinates.latitude,
        lng: newValue.coordinates.longitude,
        altitude: newValue.coordinates.altitude,
      };
      await set(inventoryCoordinatesWithAltitudeSetAtom, coordinates);
    }
  },
);

// Write-only atom to update data when a new inventory is the current one
export const inventorySetAtom = atom(
  null,
  async (_get, set, newInventory: Inventory | Omit<Inventory, "id"> | typeof RESET) => {
    if (newInventory === RESET) {
      set(storedCustomizedCoordinatesAtom, RESET);
      await set(inventoryLocalityAtom, RESET);
    } else {
      await set(inventoryLocalityAtom, newInventory.locality);
      const customizedCoordinates = newInventory.customizedCoordinates;
      if (customizedCoordinates != null) {
        const customCoordinates = {
          lat: customizedCoordinates.latitude,
          lng: customizedCoordinates.longitude,
          altitude: customizedCoordinates.altitude,
        };
        set(storedCustomizedCoordinatesAtom, customCoordinates);
        await set(inventoryCoordinatesWithAltitudeSetAtom, customCoordinates);
      } else {
        const localityCoordinates = {
          lat: newInventory.locality.coordinates.latitude,
          lng: newInventory.locality.coordinates.longitude,
          altitude: newInventory.locality.coordinates.altitude,
        };
        set(storedCustomizedCoordinatesAtom, RESET);
        await set(inventoryCoordinatesWithAltitudeSetAtom, localityCoordinates);
      }
    }
  },
);

// Returns true if and only if the current coordinates are defined, a locality is defined,
// and the current coordinates are different from the locality ones
export const areCoordinatesDifferentFromLocalityAtom = atom((get) => {
  const currentLocality = get(inventoryLocalityAtom);
  const currentCoordinates = get(inventoryCoordinatesAtom);

  return (
    currentLocality != null &&
    currentCoordinates != null &&
    (currentLocality.coordinates.latitude !== currentCoordinates.lat ||
      currentLocality.coordinates.longitude !== currentCoordinates.lng)
  );
});

// Returns true if and only if the current coordinates are defined, a locality is defined,
// and the current coordinates are different from the locality ones, including the altitude
export const areCoordinatesCustomizedFromLocalityAtom = atom((get) => {
  const areCoordinatesDifferentFromLocality = get(areCoordinatesDifferentFromLocalityAtom);
  const currentLocality = get(inventoryLocalityAtom);
  const currentAltitude = get(inventoryAltitudeAtom);

  return (
    currentLocality != null &&
    currentAltitude != null &&
    (areCoordinatesDifferentFromLocality || currentLocality.coordinates.altitude !== currentAltitude)
  );
});
