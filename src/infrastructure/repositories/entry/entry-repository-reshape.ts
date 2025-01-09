import type { Entry } from "@domain/entry/entry.js";
import type { Entry as EntryRepository } from "@infrastructure/kysely/database/Entry.js";

type RawEntry = Omit<
  EntryRepository,
  "inventaireId" | "especeId" | "sexeId" | "ageId" | "estimationNombreId" | "estimationDistanceId"
> & {
  inventaireId: string;
  especeId: string;
  sexeId: string;
  ageId: string;
  estimationNombreId: string;
  estimationDistanceId: string | null;
} & {
  behaviorIds: string[];
  environmentIds: string[];
};

export const reshapeRawEntry = (rawEntry: RawEntry): Entry => {
  const {
    inventaireId,
    especeId,
    sexeId,
    estimationNombreId,
    estimationDistanceId,
    nombre,
    commentaire,
    dateCreation,
    ...restRawEntry
  } = rawEntry;

  return {
    ...restRawEntry,
    inventoryId: inventaireId,
    speciesId: especeId,
    sexId: sexeId,
    numberEstimateId: estimationNombreId,
    distanceEstimateId: estimationDistanceId,
    number: nombre,
    comment: commentaire,
    creationDate: dateCreation,
  };
};
