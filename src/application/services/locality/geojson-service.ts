import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { LocalityGeoJSONRepository } from "@interfaces/locality-geojson-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import { featureCollection, point } from "@turf/helpers";
import { type Result, err, ok } from "neverthrow";

type GeoJSONServiceDependencies = {
  localityRepository: LocalityRepository;
  localitiesGeoJSONRepository: LocalityGeoJSONRepository;
};

export const buildGeoJSONService = ({
  localityRepository,
  localitiesGeoJSONRepository,
}: GeoJSONServiceDependencies) => {
  const getLocalities = async (loggedUser: LoggedUser | null): Promise<Result<Buffer, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const cachedLocalities = await localitiesGeoJSONRepository.getLocalities();

    if (cachedLocalities != null) {
      return ok(cachedLocalities);
    }

    const geojsonData = await updateGeoJSONData();
    return ok(geojsonData);
  };

  const updateGeoJSONData = async (): Promise<Buffer> => {
    const geoJsonLocalities = await localityRepository.getLocalitiesForGeoJSON();

    const localityPoints = geoJsonLocalities.map((geoJsonLocality) => {
      const { longitude, latitude, ...restLocality } = geoJsonLocality;
      return point([longitude, latitude], restLocality);
    });

    const localitiesCollection = featureCollection(localityPoints);

    // Store collection as cache
    await localitiesGeoJSONRepository.saveLocalities(localitiesCollection);

    return Buffer.from(JSON.stringify(localitiesCollection));
  };

  return {
    getLocalities,
    updateGeoJSONData,
  };
};

export type GeoJSONService = ReturnType<typeof buildGeoJSONService>;
