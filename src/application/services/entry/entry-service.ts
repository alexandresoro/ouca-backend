import type { Entry, EntryFindManyInput, EntryUpsertFailureReason } from "@domain/entry/entry.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { EntryRepository } from "@interfaces/entry-repository-interface.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { EntriesSearchParams, UpsertEntryInput } from "@ou-ca/common/api/entry.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type EntryServiceDependencies = {
  inventoryRepository: InventoryRepository;
  entryRepository: EntryRepository;
};

export const buildEntryService = ({ inventoryRepository, entryRepository }: EntryServiceDependencies) => {
  const findEntry = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await entryRepository.findEntryById(id));
  };

  // Be careful when calling it, it will retrieve a lot of data!
  const findAllEntries = async (): Promise<Entry[]> => {
    const entries = await entryRepository.findEntries();

    return entries;
  };

  const findPaginatedEntries = async (
    loggedUser: LoggedUser | null,
    options: Omit<EntriesSearchParams, "pageNumber" | "pageSize"> & Partial<{ pageNumber: number; pageSize: number }>,
  ): Promise<Result<Entry[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber, fromAllUsers, ...searchCriteria } = options;

    let orderBy: EntryFindManyInput["orderBy"] | undefined;
    switch (orderByField) {
      case "observateur":
        orderBy = "observerName";
        break;
      case "codeEspece":
        orderBy = "speciesCode";
        break;
      case "nomFrancais":
        orderBy = "speciesName";
        break;
      case "nombre":
        orderBy = "number";
        break;
      case "departement":
        orderBy = "department";
        break;
      case "codeCommune":
        orderBy = "townCode";
        break;
      case "nomCommune":
        orderBy = "townName";
        break;
      case "lieuDit":
        orderBy = "locality";
        break;
      case "heure":
        orderBy = "time";
        break;
      case "duree":
        orderBy = "duration";
        break;
      default:
        orderBy = orderByField;
        break;
    }

    const reshapedSearchCriteria = {
      ...searchCriteria,
      ownerId: fromAllUsers ? undefined : loggedUser.id,
    };

    const entries = await entryRepository.findEntries({
      searchCriteria: reshapedSearchCriteria,
      ...getSqlPagination({
        pageNumber,
        pageSize,
      }),
      orderBy,
      sortOrder,
    });

    return ok(entries);
  };

  const getEntriesCount = async (
    loggedUser: LoggedUser | null,
    options: EntriesSearchParams,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { orderBy, sortOrder, pageSize, pageNumber, fromAllUsers, ...searchCriteria } = options;

    const reshapedSearchCriteria = {
      ...searchCriteria,
      ownerId: fromAllUsers ? undefined : loggedUser.id,
    };

    return ok(await entryRepository.getCount(reshapedSearchCriteria));
  };

  const createEntry = async (
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry, EntryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    // Check if an exact same entry already exists or not
    const existingEntry = await entryRepository.findExistingEntry(input);

    if (existingEntry) {
      // The entry already exists so we return an error
      return err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: `${existingEntry.id}`,
      });
    }

    const createdEntry = await entryRepository.createEntry(input);

    return ok(createdEntry);
  };

  const updateEntry = async (
    id: string,
    input: UpsertEntryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry, EntryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    // First get the corresponding inventory
    const inventory = await inventoryRepository.findInventoryByEntryId(id);

    if (!loggedUser.permissions.canManageAllEntries && inventory?.ownerId !== loggedUser.id) {
      return err({ type: "notAllowed" });
    }

    // Check if an exact same entry already exists or not
    const existingEntry = await entryRepository.findExistingEntry(input);

    if (existingEntry && existingEntry.id !== id) {
      return err({
        type: "similarEntryAlreadyExists",
        correspondingEntryFound: `${existingEntry.id}`,
      });
    }

    const updatedEntry = await entryRepository.updateEntry(id, input);

    return ok(updatedEntry);
  };

  const deleteEntry = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Entry | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // First get the corresponding inventaire
    const inventaire = await inventoryRepository.findInventoryByEntryId(id);

    if (!loggedUser.permissions.canManageAllEntries && inventaire?.ownerId !== loggedUser.id) {
      return err("notAllowed");
    }

    const deletedEntry = await entryRepository.deleteEntryById(id);

    return ok(deletedEntry);
  };

  return {
    findEntry,
    findAllEntries,
    findPaginatedEntries,
    getEntriesCount,
    createEntry,
    updateEntry,
    deleteEntry,
  };
};

export type EntryService = ReturnType<typeof buildEntryService>;
