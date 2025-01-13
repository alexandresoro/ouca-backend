import type { Environment, EnvironmentCreateInput, EnvironmentFailureReason } from "@domain/environment/environment.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { EnvironmentRepository } from "@interfaces/environment-repository-interface.js";
import type { EnvironmentsSearchParams, UpsertEnvironmentInput } from "@ou-ca/common/api/environment.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type EnvironmentServiceDependencies = {
  environmentRepository: EnvironmentRepository;
};

export const buildEnvironmentService = ({ environmentRepository }: EnvironmentServiceDependencies) => {
  const findEnvironment = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const environment = await environmentRepository.findEnvironmentById(id);
    return ok(environment);
  };

  const findEnvironments = async (
    ids: string[],
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    if (ids.length === 0) {
      return ok([]);
    }

    const environments = await environmentRepository.findEnvironmentsById(ids);
    return ok(environments);
  };

  const getEntriesCountByEnvironment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await environmentRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isEnvironmentUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithEnvironment = await environmentRepository.getEntriesCountById(id);

    return ok(totalEntriesWithEnvironment > 0);
  };

  const findAllEnvironments = async (): Promise<Environment[]> => {
    const environments = await environmentRepository.findEnvironments({
      orderBy: "libelle",
    });

    return environments;
  };

  const findPaginatedEnvironments = async (
    loggedUser: LoggedUser | null,
    options: EnvironmentsSearchParams,
  ): Promise<Result<Environment[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const environments = await environmentRepository.findEnvironments(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(environments);
  };

  const getEnvironmentsCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await environmentRepository.getCount(q));
  };

  const createEnvironment = async (
    input: UpsertEnvironmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment, EnvironmentFailureReason>> => {
    if (!loggedUser?.permissions.environment.canCreate) {
      return err("notAllowed");
    }

    const createdEnvironmentResult = await environmentRepository.createEnvironment({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdEnvironmentResult;
  };

  const updateEnvironment = async (
    id: number,
    input: UpsertEnvironmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment, EnvironmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.environment.canEdit) {
      const existingData = await environmentRepository.findEnvironmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedEnvironmentResult = await environmentRepository.updateEnvironment(id, input);

    return updatedEnvironmentResult;
  };

  const deleteEnvironment = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Environment | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.environment.canDelete) {
      const existingData = await environmentRepository.findEnvironmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isEnvironmentUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedEnvironment = await environmentRepository.deleteEnvironmentById(id);
    return ok(deletedEnvironment);
  };

  const createEnvironments = async (
    environments: Omit<EnvironmentCreateInput[], "ownerId">,
    loggedUser: LoggedUser,
  ): Promise<Environment[]> => {
    const createdEnvironments = await environmentRepository.createEnvironments(
      environments.map((environment) => {
        return { ...environment, ownerId: loggedUser.id };
      }),
    );

    return createdEnvironments;
  };

  return {
    findEnvironment,
    findEnvironments,
    getEntriesCountByEnvironment,
    isEnvironmentUsed,
    findAllEnvironments,
    findPaginatedEnvironments,
    getEnvironmentsCount,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createEnvironments,
  };
};

export type EnvironmentService = ReturnType<typeof buildEnvironmentService>;
