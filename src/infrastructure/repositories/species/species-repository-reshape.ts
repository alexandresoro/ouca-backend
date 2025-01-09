import type { Species } from "@domain/species/species.js";
import type { Species as SpeciesRepository } from "@infrastructure/kysely/database/Species.js";

type RawSpecies = Omit<SpeciesRepository, "id" | "classeId"> & {
  id: string;
  classeId: string | null;
};

export const reshapeRawSpecies = (rawSpecies: RawSpecies): Species => {
  const { classeId, ...restRawSpecies } = rawSpecies;

  return {
    ...restRawSpecies,
    classId: classeId,
  };
};

export const reshapeRawSpeciesWithClassLabel = (rawSpecies: RawSpecies & { classLabel: string | null }) => {
  const { classeId, ...restRawSpecies } = rawSpecies;

  return {
    ...restRawSpecies,
    classId: classeId,
  };
};
