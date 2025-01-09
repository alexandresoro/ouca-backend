import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Town, TownCreateInput, TownFindManyInput } from "@domain/town/town.js";
import type { Result } from "neverthrow";

export type TownRepository = {
  findTownById: (id: number) => Promise<Town | null>;
  findTownByLocalityId: (localityId: string | undefined) => Promise<Town | null>;
  findTowns: (
    { departmentId, orderBy, sortOrder, q, offset, limit }: TownFindManyInput,
    ownerId?: string,
  ) => Promise<Town[]>;
  getCount: (q?: string | null, departmentId?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  findAllTownsWithDepartmentCode: () => Promise<(Town & { departmentCode: string })[]>;
  createTown: (townInput: TownCreateInput) => Promise<Result<Town, EntityFailureReason>>;
  createTowns: (townInputs: TownCreateInput[]) => Promise<Town[]>;
  updateTown: (townId: number, townInput: TownCreateInput) => Promise<Result<Town, EntityFailureReason>>;
  deleteTownById: (townId: number) => Promise<Town | null>;
};
