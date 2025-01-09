import type { SexCreateInput, SexFailureReason } from "@domain/sex/sex.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { SexRepository } from "@interfaces/sex-repository-interface.js";
import type { Sex } from "@ou-ca/common/api/entities/sex.js";
import type { SexesSearchParams, UpsertSexInput } from "@ou-ca/common/api/sex.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type SexServiceDependencies = {
  sexRepository: SexRepository;
};

export const buildSexService = ({ sexRepository }: SexServiceDependencies) => {
  const findSex = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Sex | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const sex = await sexRepository.findSexById(id);
    return ok(sex);
  };

  const getEntriesCountBySex = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await sexRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isSexUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithSex = await sexRepository.getEntriesCountById(id);

    return ok(totalEntriesWithSex > 0);
  };

  const findAllSexes = async (): Promise<Sex[]> => {
    const sexes = await sexRepository.findSexes({
      orderBy: "libelle",
    });

    return sexes;
  };

  const findPaginatedSexes = async (
    loggedUser: LoggedUser | null,
    options: SexesSearchParams,
  ): Promise<Result<Sex[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const sexes = await sexRepository.findSexes(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(sexes);
  };

  const getSexesCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await sexRepository.getCount(q));
  };

  const createSex = async (
    input: UpsertSexInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Sex, SexFailureReason>> => {
    if (!loggedUser?.permissions.sex.canCreate) {
      return err("notAllowed");
    }

    const createdSexResult = await sexRepository.createSex({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdSexResult;
  };

  const updateSex = async (
    id: number,
    input: UpsertSexInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Sex, SexFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.sex.canEdit) {
      const existingData = await sexRepository.findSexById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedSexResult = await sexRepository.updateSex(id, input);

    return updatedSexResult;
  };

  const deleteSex = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Sex | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.sex.canDelete) {
      const existingData = await sexRepository.findSexById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isSexUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedSex = await sexRepository.deleteSexById(id);
    return ok(deletedSex);
  };

  const createSexes = async (
    sexes: Omit<SexCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Sex[]> => {
    const createdSexes = await sexRepository.createSexes(
      sexes.map((sexe) => {
        return { ...sexe, ownerId: loggedUser.id };
      }),
    );

    return createdSexes;
  };

  return {
    findSex,
    getEntriesCountBySex,
    isSexUsed,
    findAllSexes,
    findPaginatedSexes,
    getSexesCount,
    createSex,
    updateSex,
    deleteSex,
    createSexes,
  };
};

export type SexService = ReturnType<typeof buildSexService>;
