import type { DistanceEstimateFailureReason } from "@domain/distance-estimate/distance-estimate.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { DistanceEstimateRepository } from "@interfaces/distance-estimate-repository-interface.js";
import type {
  DistanceEstimatesSearchParams,
  UpsertDistanceEstimateInput,
} from "@ou-ca/common/api/distance-estimate.js";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type DistanceEstimateServiceDependencies = {
  distanceEstimateRepository: DistanceEstimateRepository;
};

export const buildDistanceEstimateService = ({ distanceEstimateRepository }: DistanceEstimateServiceDependencies) => {
  const findDistanceEstimate = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const distanceEstimate = await distanceEstimateRepository.findDistanceEstimateById(id);
    return ok(distanceEstimate);
  };

  const getEntriesCountByDistanceEstimate = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await distanceEstimateRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isDistanceEstimateUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithDistanceEstimate = await distanceEstimateRepository.getEntriesCountById(id);

    return ok(totalEntriesWithDistanceEstimate > 0);
  };

  const findAllDistanceEstimates = async (): Promise<DistanceEstimate[]> => {
    const distanceEstimates = await distanceEstimateRepository.findDistanceEstimates({
      orderBy: "libelle",
    });

    return distanceEstimates;
  };

  const findPaginatedDistanceEstimates = async (
    loggedUser: LoggedUser | null,
    options: DistanceEstimatesSearchParams,
  ): Promise<Result<DistanceEstimate[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const distanceEstimates = await distanceEstimateRepository.findDistanceEstimates(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(distanceEstimates);
  };

  const getDistanceEstimatesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await distanceEstimateRepository.getCount(q));
  };

  const createDistanceEstimate = async (
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate, DistanceEstimateFailureReason>> => {
    if (!loggedUser?.permissions.distanceEstimate.canCreate) {
      return err("notAllowed");
    }

    const createdDistanceEstimateResult = await distanceEstimateRepository.createDistanceEstimate({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdDistanceEstimateResult;
  };

  const updateDistanceEstimate = async (
    id: number,
    input: UpsertDistanceEstimateInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate, DistanceEstimateFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.distanceEstimate.canEdit) {
      const existingData = await distanceEstimateRepository.findDistanceEstimateById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updateDistanceEstimateResult = await distanceEstimateRepository.updateDistanceEstimate(id, input);

    return updateDistanceEstimateResult;
  };

  const deleteDistanceEstimate = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<DistanceEstimate | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.distanceEstimate.canDelete) {
      const existingData = await distanceEstimateRepository.findDistanceEstimateById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isDistanceEstimateUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedDistanceEstimate = await distanceEstimateRepository.deleteDistanceEstimateById(id);
    return ok(deletedDistanceEstimate);
  };

  const createDistanceEstimates = async (
    distanceEstimates: UpsertDistanceEstimateInput[],
    loggedUser: LoggedUser,
  ): Promise<readonly DistanceEstimate[]> => {
    const createdDistanceEstimates = await distanceEstimateRepository.createDistanceEstimates(
      distanceEstimates.map((distanceEstimate) => {
        return { ...distanceEstimate, ownerId: loggedUser.id };
      }),
    );

    return createdDistanceEstimates;
  };

  return {
    findDistanceEstimate,
    getEntriesCountByDistanceEstimate,
    isDistanceEstimateUsed,
    findAllDistanceEstimates,
    findPaginatedDistanceEstimates,
    getDistanceEstimatesCount,
    createDistanceEstimate,
    updateDistanceEstimate,
    deleteDistanceEstimate,
    createDistanceEstimates,
  };
};

export type DistanceEstimateService = ReturnType<typeof buildDistanceEstimateService>;
