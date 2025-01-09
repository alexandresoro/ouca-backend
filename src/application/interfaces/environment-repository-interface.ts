import type { Environment, EnvironmentCreateInput, EnvironmentFindManyInput } from "@domain/environment/environment.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type EnvironmentRepository = {
  findEnvironmentById: (id: number) => Promise<Environment | null>;
  findEnvironmentsById: (ids: string[]) => Promise<Environment[]>;
  findEnvironments: (
    { orderBy, sortOrder, q, offset, limit }: EnvironmentFindManyInput,
    ownerId?: string,
  ) => Promise<Environment[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createEnvironment: (environmentInput: EnvironmentCreateInput) => Promise<Result<Environment, EntityFailureReason>>;
  createEnvironments: (environmentInputs: EnvironmentCreateInput[]) => Promise<Environment[]>;
  updateEnvironment: (
    environmentId: number,
    environmentInput: EnvironmentCreateInput,
  ) => Promise<Result<Environment, EntityFailureReason>>;
  deleteEnvironmentById: (environmentId: number) => Promise<Environment | null>;
};
