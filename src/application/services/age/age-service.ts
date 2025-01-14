import type { Age, AgeCreateInput, AgeFailureReason } from "@domain/age/age.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { AgeRepository } from "@interfaces/age-repository-interface.js";
import { type Result, err, ok } from "neverthrow";
import type { EntitiesCommonQueryParams, EntitiesWithLabelOrderByCommon } from "../entities-common.js";
import { getSqlPagination } from "../entities-utils.js";

type AgeServiceDependencies = {
  ageRepository: AgeRepository;
};

export type AgesQueryParams = EntitiesCommonQueryParams & {
  orderBy?: EntitiesWithLabelOrderByCommon;
};

export type UpsertAgeInput = Omit<AgeCreateInput, "ownerId">;

export const buildAgeService = ({ ageRepository }: AgeServiceDependencies) => {
  const findAge = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Age | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const age = await ageRepository.findAgeById(id);
    return ok(age);
  };

  const getEntriesCountByAge = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await ageRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isAgeUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithAge = await ageRepository.getEntriesCountById(id);

    return ok(totalEntriesWithAge > 0);
  };

  const findAllAges = async (): Promise<Age[]> => {
    const ages = await ageRepository.findAges({
      orderBy: "libelle",
    });

    return ages;
  };

  const findPaginatedAges = async (
    loggedUser: LoggedUser | null,
    options: AgesQueryParams,
  ): Promise<Result<Age[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const ages = await ageRepository.findAges(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(ages);
  };

  const getAgesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await ageRepository.getCount(q));
  };

  const createAge = async (
    input: UpsertAgeInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Age, AgeFailureReason>> => {
    if (!loggedUser?.permissions.age.canCreate) {
      return err("notAllowed");
    }

    const createdAgeResult = await ageRepository.createAge({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdAgeResult;
  };

  const updateAge = async (
    id: number,
    input: UpsertAgeInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Age, AgeFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.age.canEdit) {
      const existingData = await ageRepository.findAgeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const upsertedAgeResult = await ageRepository.updateAge(id, input);

    return upsertedAgeResult;
  };

  const deleteAge = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Age | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.age.canDelete) {
      const existingData = await ageRepository.findAgeById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isAgeUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedAge = await ageRepository.deleteAgeById(id);
    return ok(deletedAge);
  };

  const createAges = async (
    ages: Omit<AgeCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Age[]> => {
    const createdAges = await ageRepository.createAges(
      ages.map((age) => {
        return { ...age, ownerId: loggedUser.id };
      }),
    );

    return createdAges;
  };

  return {
    findAge,
    getEntriesCountByAge,
    isAgeUsed,
    findAllAges,
    findPaginatedAges,
    getAgesCount,
    createAge,
    updateAge,
    deleteAge,
    createAges,
  };
};

export type AgeService = ReturnType<typeof buildAgeService>;
