import type { Locality as LocalityDomain, LocalityFailureReason } from "@domain/locality/locality.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { Locality } from "@ou-ca/common/api/entities/locality.js";
import type { LocalitiesSearchParams, UpsertLocalityInput } from "@ou-ca/common/api/locality.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";
import { reshapeLocalityRepositoryToApi } from "./locality-service-reshape.js";

type LocalityServiceDependencies = {
  localityRepository: LocalityRepository;
  inventoryRepository: InventoryRepository;
};

export const buildLocalityService = ({ localityRepository, inventoryRepository }: LocalityServiceDependencies) => {
  const findLocality = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const locality = await localityRepository.findLocalityById(id);
    return ok(reshapeLocalityRepositoryToApi(locality));
  };

  const getInventoriesCountByLocality = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await inventoryRepository.getCountByLocality(id));
  };

  const getEntriesCountByLocality = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isLocalityUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalInventoriesWithLocality = await inventoryRepository.getCountByLocality(id);

    return ok(totalInventoriesWithLocality > 0);
  };

  const findLocalityOfInventoryId = async (
    inventoryId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const locality = await localityRepository.findLocalityByInventoryId(inventoryId);
    return ok(reshapeLocalityRepositoryToApi(locality));
  };

  const findAllLocalities = async (): Promise<Locality[]> => {
    const localities = await localityRepository.findLocalities({
      orderBy: "nom",
    });

    const enrichedLocalities = localities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality);
    });

    return [...enrichedLocalities];
  };

  const findPaginatedLocalities = async (
    loggedUser: LoggedUser | null,
    options: LocalitiesSearchParams,
  ): Promise<Result<Locality[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, townId, orderBy: orderByField, sortOrder, ...pagination } = options;

    const localities = await localityRepository.findLocalities(
      {
        q,
        ...getSqlPagination(pagination),
        townId: townId,
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    const enrichedLocalities = localities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality);
    });

    return ok([...enrichedLocalities]);
  };

  const findAllLocalitiesWithTownAndDepartment = async (): Promise<
    (LocalityDomain & {
      townCode: number;
      townName: string;
      departmentCode: string;
    })[]
  > => {
    return localityRepository.findAllLocalitiesWithTownAndDepartmentCode();
  };

  const getLocalitiesCount = async (
    loggedUser: LoggedUser | null,
    { q, townId }: Pick<LocalitiesSearchParams, "q" | "townId">,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCount(q, townId));
  };

  const createLocality = async (
    input: UpsertLocalityInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality, LocalityFailureReason>> => {
    if (!loggedUser?.permissions.locality.canCreate) {
      return err("notAllowed");
    }

    const createdLocalityResult = await localityRepository.createLocality({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdLocalityResult.map((createdLocality) => {
      return reshapeLocalityRepositoryToApi(createdLocality);
    });
  };

  const updateLocality = async (
    id: number,
    input: UpsertLocalityInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality, LocalityFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.locality.canEdit) {
      const existingData = await localityRepository.findLocalityById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedLocalityResult = await localityRepository.updateLocality(id, input);

    return updatedLocalityResult.map((updatedLocality) => {
      return reshapeLocalityRepositoryToApi(updatedLocality);
    });
  };

  const deleteLocality = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Locality | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.locality.canDelete) {
      const existingData = await localityRepository.findLocalityById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isLocalityUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedLocality = await localityRepository.deleteLocalityById(id);
    return ok(reshapeLocalityRepositoryToApi(deletedLocality));
  };

  const createLocalities = async (localities: UpsertLocalityInput[], loggedUser: LoggedUser): Promise<Locality[]> => {
    const createdLocalities = await localityRepository.createLocalities(
      localities.map((locality) => {
        return {
          ...locality,
          ownerId: loggedUser.id,
        };
      }),
    );

    const enrichedCreatedLocalities = createdLocalities.map((locality) => {
      return reshapeLocalityRepositoryToApi(locality);
    });

    return enrichedCreatedLocalities;
  };

  return {
    findLocality,
    getInventoriesCountByLocality,
    getEntriesCountByLocality,
    isLocalityUsed,
    findLocalityOfInventoryId,
    findAllLocalities,
    findAllLocalitiesWithTownAndDepartment,
    findPaginatedLocalities,
    getLocalitiesCount,
    createLocality,
    updateLocality,
    deleteLocality,
    createLocalities,
  };
};

export type LocalityService = ReturnType<typeof buildLocalityService>;
