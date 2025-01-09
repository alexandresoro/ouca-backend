import type { AgeCreateInput } from "@domain/age/age.js";
import type { ObserverFailureReason } from "@domain/observer/observer.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { ObserverRepository } from "@interfaces/observer-repository-interface.js";
import type { Observer } from "@ou-ca/common/api/entities/observer.js";
import type { ObserversSearchParams, UpsertObserverInput } from "@ou-ca/common/api/observer.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type ObserverServiceDependencies = {
  observerRepository: ObserverRepository;
};

export const buildObserverService = ({ observerRepository }: ObserverServiceDependencies) => {
  const findObserver = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Observer | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const observer = await observerRepository.findObserverById(id);
    return ok(observer);
  };

  const getEntriesCountByObserver = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await observerRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isObserverUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithObserver = await observerRepository.getEntriesCountById(id);

    return ok(totalEntriesWithObserver > 0);
  };

  const findObservers = async (
    ids: string[],
    loggedUser: LoggedUser | null,
  ): Promise<Result<Observer[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    if (ids.length === 0) {
      return ok([]);
    }

    const observers = await observerRepository.findObserversById(ids);
    return ok(observers);
  };

  const findAllObservers = async (): Promise<Observer[]> => {
    const observers = await observerRepository.findObservers({
      orderBy: "libelle",
    });

    return observers;
  };

  const findPaginatedObservers = async (
    loggedUser: LoggedUser | null,
    options: ObserversSearchParams,
  ): Promise<Result<Observer[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const observers = await observerRepository.findObservers(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(observers);
  };

  const getObserversCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await observerRepository.getCount(q));
  };

  const createObserver = async (
    input: UpsertObserverInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Observer, ObserverFailureReason>> => {
    if (!loggedUser?.permissions.observer.canCreate) {
      return err("notAllowed");
    }

    // Create a new observer
    const createdObservateurResult = await observerRepository.createObserver({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdObservateurResult;
  };

  const updateObserver = async (
    id: number,
    input: UpsertObserverInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Observer, ObserverFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.observer.canEdit) {
      const existingData = await observerRepository.findObserverById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    // Update an existing observer
    const updatedObservateurResult = await observerRepository.updateObserver(id, input);

    return updatedObservateurResult;
  };

  const deleteObserver = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Observer | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.observer.canDelete) {
      const existingData = await observerRepository.findObserverById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isObserverUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedObserver = await observerRepository.deleteObserverById(id);
    return ok(deletedObserver);
  };

  const createObservers = async (
    observers: Omit<AgeCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<Observer[]> => {
    const createdObservers = await observerRepository.createObservers(
      observers.map((observateur) => {
        return { ...observateur, ownerId: loggedUser.id };
      }),
    );

    return createdObservers;
  };

  return {
    findObserver,
    getEntriesCountByObserver,
    isObserverUsed,
    findObservers,
    findAllObservers,
    findPaginatedObservers,
    getObserversCount,
    createObserver,
    updateObserver,
    deleteObserver,
    createObservers,
  };
};

export type ObserverService = ReturnType<typeof buildObserverService>;
