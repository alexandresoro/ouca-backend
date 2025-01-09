import type { Inventory, InventoryCreateInput, InventoryFindManyInput } from "@domain/inventory/inventory.js";

export type InventoryRepository = {
  findInventoryById(id: string): Promise<Inventory | null>;
  findInventoryByEntryId(entryId: string): Promise<Inventory | null>;
  findInventoryIndex(
    id: string,
    options: {
      orderBy: NonNullable<InventoryFindManyInput["orderBy"]>;
      sortOrder: NonNullable<InventoryFindManyInput["sortOrder"]>;
      ownerId: string | null;
    },
  ): Promise<number | null>;
  findInventories({ orderBy, sortOrder, offset, limit, ownerId }: InventoryFindManyInput): Promise<Inventory[]>;
  findExistingInventory(criteria: InventoryCreateInput): Promise<Inventory | null>;
  getCount({ ownerId }: { ownerId: string | null }): Promise<number>;
  getEntriesCountById: (id: string) => Promise<number>;
  getCountByLocality(localityId: string): Promise<number>;
  createInventory(inventoryInput: InventoryCreateInput): Promise<Inventory>;
  updateInventory(inventoryId: string, inventoryInput: InventoryCreateInput): Promise<Inventory>;
  deleteInventoryById(inventoryId: string): Promise<Inventory | null>;
};
