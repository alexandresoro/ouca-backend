import type {
  DistanceEstimate,
  DistanceEstimateCreateInput,
  DistanceEstimateFindManyInput,
} from "@domain/distance-estimate/distance-estimate.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type DistanceEstimateRepository = {
  findDistanceEstimateById: (id: number) => Promise<DistanceEstimate | null>;
  findDistanceEstimates: (
    { orderBy, sortOrder, q, offset, limit }: DistanceEstimateFindManyInput,
    ownerId?: string,
  ) => Promise<DistanceEstimate[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createDistanceEstimate: (
    distanceEstimateInput: DistanceEstimateCreateInput,
  ) => Promise<Result<DistanceEstimate, EntityFailureReason>>;
  createDistanceEstimates: (distanceEstimateInputs: DistanceEstimateCreateInput[]) => Promise<DistanceEstimate[]>;
  updateDistanceEstimate: (
    distanceEstimateId: number,
    distanceEstimateInput: DistanceEstimateCreateInput,
  ) => Promise<Result<DistanceEstimate, EntityFailureReason>>;
  deleteDistanceEstimateById: (distanceEstimateId: number) => Promise<DistanceEstimate | null>;
};
