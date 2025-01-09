import type { Observer, ObserverCreateInput, ObserverFindManyInput } from "@domain/observer/observer.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type ObserverRepository = {
  findObserverById: (id: number) => Promise<Observer | null>;
  findObserversById: (ids: string[]) => Promise<Observer[]>;
  findObservers: (
    { orderBy, sortOrder, q, offset, limit }: ObserverFindManyInput,
    ownerId?: string,
  ) => Promise<Observer[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createObserver: (observerInput: ObserverCreateInput) => Promise<Result<Observer, EntityFailureReason>>;
  createObservers: (observerInputs: ObserverCreateInput[]) => Promise<Observer[]>;
  updateObserver: (
    observerId: number,
    observerInput: ObserverCreateInput,
  ) => Promise<Result<Observer, EntityFailureReason>>;
  deleteObserverById: (observerId: number) => Promise<Observer | null>;
};
