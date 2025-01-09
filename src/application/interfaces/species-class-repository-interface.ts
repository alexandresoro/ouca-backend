import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type {
  SpeciesClass,
  SpeciesClassCreateInput,
  SpeciesClassFindManyInput,
} from "@domain/species-class/species-class.js";
import type { Result } from "neverthrow";

export type SpeciesClassRepository = {
  findSpeciesClassById: (id: number) => Promise<SpeciesClass | null>;
  findSpeciesClassBySpeciesId: (speciesId: number | undefined) => Promise<SpeciesClass | null>;
  findSpeciesClasses: (
    { orderBy, sortOrder, q, offset, limit }: SpeciesClassFindManyInput,
    ownerId?: string,
  ) => Promise<SpeciesClass[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createSpeciesClass: (
    speciesClassInput: SpeciesClassCreateInput,
  ) => Promise<Result<SpeciesClass, EntityFailureReason>>;
  createSpeciesClasses: (speciesClassInputs: SpeciesClassCreateInput[]) => Promise<SpeciesClass[]>;
  updateSpeciesClass: (
    speciesClassId: number,
    speciesClassInput: SpeciesClassCreateInput,
  ) => Promise<Result<SpeciesClass, EntityFailureReason>>;
  deleteSpeciesClassById: (speciesClassId: number) => Promise<SpeciesClass | null>;
};
