import type { BehaviorCreateInput, BehaviorFailureReason } from "@domain/behavior/behavior.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { BehaviorRepository } from "@interfaces/behavior-repository-interface.js";
import type { BehaviorsSearchParams, UpsertBehaviorInput } from "@ou-ca/common/api/behavior.js";
import type { Behavior } from "@ou-ca/common/api/entities/behavior.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type BehaviorServiceDependencies = {
  behaviorRepository: BehaviorRepository;
};

export const buildBehaviorService = ({ behaviorRepository }: BehaviorServiceDependencies) => {
  const findBehavior = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const behavior = await behaviorRepository.findBehaviorById(id);
    return ok(behavior);
  };

  const findBehaviors = async (
    ids: string[],
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    if (ids.length === 0) {
      return ok([]);
    }

    const behaviors = await behaviorRepository.findBehaviorsById(ids);
    return ok(behaviors);
  };

  const getEntriesCountByBehavior = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await behaviorRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isBehaviorUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithBehavior = await behaviorRepository.getEntriesCountById(id);

    return ok(totalEntriesWithBehavior > 0);
  };

  const findAllBehaviors = async (): Promise<Behavior[]> => {
    const behaviors = await behaviorRepository.findBehaviors({
      orderBy: "code",
    });

    return behaviors;
  };

  const findPaginatedBehaviors = async (
    loggedUser: LoggedUser | null,
    options: BehaviorsSearchParams,
  ): Promise<Result<Behavior[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const behaviors = await behaviorRepository.findBehaviors(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(behaviors);
  };

  const getBehaviorsCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await behaviorRepository.getCount(q));
  };

  const createBehavior = async (
    input: UpsertBehaviorInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior, BehaviorFailureReason>> => {
    if (!loggedUser?.permissions.behavior.canCreate) {
      return err("notAllowed");
    }

    const createdBehaviorResult = await behaviorRepository.createBehavior({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdBehaviorResult;
  };

  const updateBehavior = async (
    id: number,
    input: UpsertBehaviorInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior, BehaviorFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.behavior.canEdit) {
      const existingData = await behaviorRepository.findBehaviorById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedBehaviorResult = await behaviorRepository.updateBehavior(id, input);

    return updatedBehaviorResult;
  };

  const deleteBehavior = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Behavior | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.behavior.canDelete) {
      const existingData = await behaviorRepository.findBehaviorById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isBehaviorUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedBehavior = await behaviorRepository.deleteBehaviorById(id);
    return ok(deletedBehavior);
  };

  const createBehaviors = async (
    behaviors: Omit<BehaviorCreateInput[], "ownerId">,
    loggedUser: LoggedUser,
  ): Promise<readonly Behavior[]> => {
    const createdBehaviors = await behaviorRepository.createBehaviors(
      behaviors.map((behavior) => {
        return { ...behavior, ownerId: loggedUser.id };
      }),
    );

    return createdBehaviors;
  };

  return {
    findBehavior,
    findBehaviors,
    getEntriesCountByBehavior,
    isBehaviorUsed,
    findAllBehaviors,
    findPaginatedBehaviors,
    getBehaviorsCount,
    createBehavior,
    updateBehavior,
    deleteBehavior,
    createBehaviors,
  };
};

export type BehaviorService = ReturnType<typeof buildBehaviorService>;
