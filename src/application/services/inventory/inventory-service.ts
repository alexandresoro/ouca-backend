import type {
  Inventory,
  InventoryDeleteFailureReason,
  InventoryFindManyInput,
  InventoryUpdateFailureReason,
  InventoryUpsertFailureReason,
} from "@domain/inventory/inventory.js";
import type { AccessFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { EntryRepository } from "@interfaces/entry-repository-interface.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { InventoriesSearchParams, UpsertInventoryInput } from "@ou-ca/common/api/inventory.js";
import { type Result, err, ok } from "neverthrow";
import { logger } from "../../../utils/logger.js";
import { getSqlPagination } from "../entities-utils.js";
import { reshapeInputInventoryUpsertData } from "./inventory-service-reshape.js";

type InventoryServiceDependencies = {
  inventoryRepository: InventoryRepository;
  entryRepository: EntryRepository;
  localityRepository: LocalityRepository;
};

export const buildInventoryService = ({
  inventoryRepository,
  entryRepository,
  localityRepository,
}: InventoryServiceDependencies) => {
  const findInventory = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const inventory = await inventoryRepository.findInventoryById(id);

    return ok(inventory);
  };

  const findInventoryIndex = async (
    id: string,
    order: {
      orderBy: NonNullable<InventoryFindManyInput["orderBy"]>;
      sortOrder: NonNullable<InventoryFindManyInput["sortOrder"]>;
    },
    loggedUser: LoggedUser | null,
  ): Promise<Result<number | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // TODO: Right now we simply filter the inventories by the owner ID
    return ok(await inventoryRepository.findInventoryIndex(id, { ...order, ownerId: loggedUser.id }));
  };

  const findInventoryOfEntryId = async (
    entryId: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await inventoryRepository.findInventoryByEntryId(entryId));
  };

  const findAllInventories = async (): Promise<Inventory[]> => {
    const inventories = await inventoryRepository.findInventories({});

    return inventories;
  };

  const findPaginatedInventories = async (
    loggedUser: LoggedUser | null,
    options: InventoriesSearchParams,
  ): Promise<Result<Inventory[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { orderBy: orderByField, sortOrder, pageSize, pageNumber } = options;

    const inventories = await inventoryRepository.findInventories({
      ...getSqlPagination({
        pageNumber,
        pageSize,
      }),
      orderBy: orderByField,
      sortOrder,
      // TODO: Right now we simply filter the inventories by the owner ID
      ownerId: loggedUser.id,
    });

    return ok(inventories);
  };

  const getInventoriesCount = async (loggedUser: LoggedUser | null): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // TODO: Right now we simply filter the inventories by the owner ID
    return ok(await inventoryRepository.getCount({ ownerId: loggedUser.id }));
  };

  const createInventory = async (
    input: UpsertInventoryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory, InventoryUpsertFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const locality = await localityRepository.findLocalityById(Number.parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`,
      );
      return err("requiredDataNotFound");
    }

    // Check if an exact same inventory already exists or not
    const existingInventory = await inventoryRepository.findExistingInventory(
      reshapeInputInventoryUpsertData(input, locality),
    );

    if (existingInventory) {
      // We wished to create an inventory but we already found one,
      // so we won't create anything and simply return the existing one
      return ok(existingInventory);
    }

    // The inventory we wish to create does not have an equivalent existing one
    // In that case, we proceed as a classic create

    const createdInventory = await inventoryRepository.createInventory({
      ...reshapeInputInventoryUpsertData(input, locality),
      ownerId: loggedUser.id,
    });

    return ok(createdInventory);
  };

  const updateInventory = async (
    id: string,
    input: UpsertInventoryInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory, InventoryUpdateFailureReason>> => {
    if (!loggedUser) {
      return err({ type: "notAllowed" });
    }

    const { migrateDonneesIfMatchesExistingInventaire = false, ...inputData } = input;

    const locality = await localityRepository.findLocalityById(Number.parseInt(input.localityId));
    if (!locality) {
      logger.warn(
        {
          localityId: input.localityId,
        },
        `Corresponding locality for ID=${input.localityId} not found`,
      );
      return err({ type: "requiredDataNotFound" });
    }

    // Check if an exact same inventory already exists or not
    const existingInventory = await inventoryRepository.findExistingInventory(
      reshapeInputInventoryUpsertData(inputData, locality),
    );

    if (existingInventory) {
      // The inventory we wish to upsert has already an existing equivalent
      // So now it depends on what we wished to do initially

      if (!migrateDonneesIfMatchesExistingInventaire) {
        // This is the tricky case
        // We had an existing inventory A that we expected to update
        // Meanwhile we found that the new values correspond to another already inventory B
        // So we should not update inventory A but we should provide as feedback that we did not update it
        // because it is already corresponding to B.
        // With this information, it is up to the caller to react accordingly
        // (e.g. ask all donnees from inventory B to be moved to A),
        // but this is not up to this upsert method to take this initiave
        return err({
          type: "similarInventoryAlreadyExists",
          correspondingInventoryFound: existingInventory.id,
        });
      }

      // In that case, the user explicitely requested that the donnees of inventory A
      // should now be linked to inventory B if matches

      // We update the inventory ID for the donnees and we delete the duplicated inventory
      await entryRepository.updateAssociatedInventory(id, existingInventory.id);

      await inventoryRepository.deleteInventoryById(id);

      // We wished to create an inventory but we already found one,
      // so we won't create anything and simply return the existing one
      return ok(existingInventory);
    }

    // The inventory we wish to update does not have an equivalent existing one
    // In that case, we proceed as a classic update

    // Update an existing inventory
    const updatedInventory = await inventoryRepository.updateInventory(
      id,
      reshapeInputInventoryUpsertData(inputData, locality),
    );

    return ok(updatedInventory);
  };

  const deleteInventory = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Inventory | null, InventoryDeleteFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing inventory
    if (!loggedUser.permissions.canManageAllEntries) {
      const existingInventory = await inventoryRepository.findInventoryById(id);

      if (existingInventory?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const entriesOfInventory = await inventoryRepository.getEntriesCountById(id);

    if (entriesOfInventory > 0) {
      return err("inventoryStillInUse");
    }

    const deletedInventoryResult = await inventoryRepository.deleteInventoryById(id);

    return ok(deletedInventoryResult);
  };

  return {
    findInventory,
    findInventoryIndex,
    findInventoryOfEntryId,
    findAllInventories,
    findPaginatedInventories,
    getInventoriesCount,
    createInventory,
    updateInventory,
    deleteInventory,
  };
};

export type InventoryService = ReturnType<typeof buildInventoryService>;
