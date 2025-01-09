import type { GeoJSONLocality } from "@domain/locality/locality-geojson.js";
import type { Locality, LocalityCreateInput, LocalityFindManyInput } from "@domain/locality/locality.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type LocalityRepository = {
  findLocalityById: (id: number) => Promise<Locality | null>;
  findLocalityByInventoryId: (inventoryId: string | undefined) => Promise<Locality | null>;
  findLocalities: (
    { townId, orderBy, sortOrder, q, offset, limit }: LocalityFindManyInput,
    ownerId?: string,
  ) => Promise<Locality[]>;
  getCount: (q?: string | null, townId?: string | null, departmentId?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  findAllLocalitiesWithTownAndDepartmentCode: () => Promise<
    (Locality & {
      townCode: number;
      townName: string;
      departmentCode: string;
    })[]
  >;
  createLocality: (localityInput: LocalityCreateInput) => Promise<Result<Locality, EntityFailureReason>>;
  createLocalities: (localityInputs: LocalityCreateInput[]) => Promise<Locality[]>;
  updateLocality: (
    localityId: number,
    localityInput: LocalityCreateInput,
  ) => Promise<Result<Locality, EntityFailureReason>>;
  deleteLocalityById: (localityId: number) => Promise<Locality | null>;
  getLocalitiesForGeoJSON: () => Promise<GeoJSONLocality[]>;
};
