import type {
  NumberEstimate,
  NumberEstimateCreateInput,
  NumberEstimateFindManyInput,
} from "@domain/number-estimate/number-estimate.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type NumberEstimateRepository = {
  findNumberEstimateById: (id: number) => Promise<NumberEstimate | null>;
  findNumberEstimates: (
    { orderBy, sortOrder, q, offset, limit }: NumberEstimateFindManyInput,
    ownerId?: string,
  ) => Promise<NumberEstimate[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createNumberEstimate: (
    numberEstimateInput: NumberEstimateCreateInput,
  ) => Promise<Result<NumberEstimate, EntityFailureReason>>;
  createNumberEstimates: (numberEstimateInputs: NumberEstimateCreateInput[]) => Promise<NumberEstimate[]>;
  updateNumberEstimate: (
    numberEstimateId: number,
    numberEstimateInput: NumberEstimateCreateInput,
  ) => Promise<Result<NumberEstimate, EntityFailureReason>>;
  deleteNumberEstimateById: (numberEstimateId: number) => Promise<NumberEstimate | null>;
};
