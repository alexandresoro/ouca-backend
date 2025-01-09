import type { Behavior, BehaviorCreateInput, BehaviorFindManyInput } from "@domain/behavior/behavior.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type BehaviorRepository = {
  findBehaviorById: (id: number) => Promise<Behavior | null>;
  findBehaviorsById: (ids: string[]) => Promise<Behavior[]>;
  findBehaviors: (
    { orderBy, sortOrder, q, offset, limit }: BehaviorFindManyInput,
    ownerId?: string,
  ) => Promise<Behavior[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createBehavior: (behaviorInput: BehaviorCreateInput) => Promise<Result<Behavior, EntityFailureReason>>;
  createBehaviors: (behaviorInputs: BehaviorCreateInput[]) => Promise<Behavior[]>;
  updateBehavior: (
    behaviorId: number,
    behaviorInput: BehaviorCreateInput,
  ) => Promise<Result<Behavior, EntityFailureReason>>;
  deleteBehaviorById: (behaviorId: number) => Promise<Behavior | null>;
};
