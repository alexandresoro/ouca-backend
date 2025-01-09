import type { Sex, SexCreateInput, SexFindManyInput } from "@domain/sex/sex.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type SexRepository = {
  findSexById: (id: number) => Promise<Sex | null>;
  findSexes: ({ orderBy, sortOrder, q, offset, limit }: SexFindManyInput, ownerId?: string) => Promise<Sex[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createSex: (sexInput: SexCreateInput) => Promise<Result<Sex, EntityFailureReason>>;
  createSexes: (sexInputs: SexCreateInput[]) => Promise<Sex[]>;
  updateSex: (sexId: number, sexInput: SexCreateInput) => Promise<Result<Sex, EntityFailureReason>>;
  deleteSexById: (sexId: number) => Promise<Sex | null>;
};
