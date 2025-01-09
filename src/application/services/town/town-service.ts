import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { TownCreateInput, TownFailureReason } from "@domain/town/town.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { TownRepository } from "@interfaces/town-repository-interface.js";
import type { Town } from "@ou-ca/common/api/entities/town.js";
import type { TownsSearchParams, UpsertTownInput } from "@ou-ca/common/api/town.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type TownServiceDependencies = {
  townRepository: TownRepository;
  localityRepository: LocalityRepository;
};

export const buildTownService = ({ townRepository, localityRepository }: TownServiceDependencies) => {
  const findTown = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }
    const town = await townRepository.findTownById(id);
    return ok(town);
  };

  const getEntriesCountByTown = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await townRepository.getEntriesCountById(id, loggedUser.id));
  };

  const getLocalitiesCountByTown = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCount(undefined, id));
  };

  const findTownOfLocalityId = async (
    localityId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const town = await townRepository.findTownByLocalityId(localityId);
    return ok(town);
  };

  const isTownUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalLocalitiesWithTown = await localityRepository.getCount(undefined, id);

    return ok(totalLocalitiesWithTown > 0);
  };

  const findAllTowns = async (): Promise<Town[]> => {
    const towns = await townRepository.findTowns({
      orderBy: "nom",
    });

    return towns;
  };

  const findPaginatedTowns = async (
    loggedUser: LoggedUser | null,
    options: TownsSearchParams,
  ): Promise<Result<Town[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, departmentId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const towns = await townRepository.findTowns(
      {
        q,
        ...getSqlPagination(pagination),
        departmentId: departmentId,
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(towns);
  };

  const findAllTownsWithDepartments = async (): Promise<(Omit<Town, "editable"> & { departmentCode: string })[]> => {
    const townsWithDepartments = await townRepository.findAllTownsWithDepartmentCode();
    return [...townsWithDepartments];
  };

  const getTownsCount = async (
    loggedUser: LoggedUser | null,
    { q, departmentId }: Pick<TownsSearchParams, "q" | "departmentId">,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await townRepository.getCount(q, departmentId));
  };

  const createTown = async (
    input: UpsertTownInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town, TownFailureReason>> => {
    if (!loggedUser?.permissions.town.canCreate) {
      return err("notAllowed");
    }

    const createdTownResult = await townRepository.createTown({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdTownResult;
  };

  const updateTown = async (
    id: number,
    input: UpsertTownInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town, TownFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.town.canEdit) {
      const existingData = await townRepository.findTownById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedTownResult = await townRepository.updateTown(id, input);

    return updatedTownResult;
  };

  const deleteTown = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Town | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.town.canDelete) {
      const existingData = await townRepository.findTownById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isTownUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedTown = await townRepository.deleteTownById(id);
    return ok(deletedTown);
  };

  const createTowns = async (towns: Omit<TownCreateInput, "ownerId">[], loggedUser: LoggedUser): Promise<Town[]> => {
    const createdTowns = await townRepository.createTowns(
      towns.map((town) => {
        return { ...town, ownerId: loggedUser.id };
      }),
    );

    return createdTowns;
  };

  return {
    findTown,
    getEntriesCountByTown,
    getLocalitiesCountByTown,
    isTownUsed,
    findTownOfLocalityId,
    findAllTowns,
    findAllTownsWithDepartments,
    findPaginatedTowns,
    getTownsCount,
    createTown,
    updateTown,
    deleteTown,
    createTowns,
  };
};

export type TownService = ReturnType<typeof buildTownService>;
