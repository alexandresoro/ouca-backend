import type { Age, AgeCreateInput, AgeFindManyInput } from "@domain/age/age.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type AgeRepository = {
  findAgeById: (id: number) => Promise<Age | null>;
  findAges: ({ orderBy, sortOrder, q, offset, limit }: AgeFindManyInput, ownerId?: string) => Promise<Age[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createAge: (ageInput: AgeCreateInput) => Promise<Result<Age, EntityFailureReason>>;
  createAges: (ageInputs: AgeCreateInput[]) => Promise<Age[]>;
  updateAge: (ageId: number, ageInput: AgeCreateInput) => Promise<Result<Age, EntityFailureReason>>;
  deleteAgeById: (ageId: number) => Promise<Age | null>;
};
