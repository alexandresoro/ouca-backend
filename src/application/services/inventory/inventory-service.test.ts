import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { inventoryFactory } from "@fixtures/domain/inventory/inventory.fixtures.js";
import { localityFactory } from "@fixtures/domain/locality/locality.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertInventoryInputFactory } from "@fixtures/services/inventory/inventory-service.fixtures.js";
import type { EntryRepository } from "@interfaces/entry-repository-interface.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { InventoriesSearchParams } from "@ou-ca/common/api/inventory.js";
import { getHumanFriendlyTimeFromMinutes } from "@ou-ca/common/utils/time-format-convert.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildInventoryService } from "./inventory-service.js";

const inventoryRepository = mock<InventoryRepository>();
const entryRepository = mock<EntryRepository>();
const localityRepository = mock<LocalityRepository>();

const inventaireService = buildInventoryService({
  inventoryRepository,
  entryRepository,
  localityRepository,
});

beforeEach(() => {
  inventoryRepository.findInventoryById.mock.resetCalls();
  inventoryRepository.findInventoryByEntryId.mock.resetCalls();
  inventoryRepository.findInventories.mock.resetCalls();
  inventoryRepository.findExistingInventory.mock.resetCalls();
  inventoryRepository.updateInventory.mock.resetCalls();
  inventoryRepository.createInventory.mock.resetCalls();
  inventoryRepository.deleteInventoryById.mock.resetCalls();
  inventoryRepository.getCount.mock.resetCalls();
  inventoryRepository.getCountByLocality.mock.resetCalls();
  entryRepository.updateAssociatedInventory.mock.resetCalls();
});

describe("Find inventory", () => {
  test("should handle a matching inventory", async () => {
    const inventoryData = inventoryFactory.build();
    const loggedUser = loggedUserFactory.build();

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventoryData));

    await inventaireService.findInventory("12", loggedUser);

    assert.strictEqual(inventoryRepository.findInventoryById.mock.callCount(), 1);
    assert.deepStrictEqual(inventoryRepository.findInventoryById.mock.calls[0].arguments, ["12"]);
  });

  test("should handle inventory not found", async () => {
    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await inventaireService.findInventory("10", loggedUser), ok(null));

    assert.strictEqual(inventoryRepository.findInventoryById.mock.callCount(), 1);
    assert.deepStrictEqual(inventoryRepository.findInventoryById.mock.calls[0].arguments, ["10"]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    assert.deepStrictEqual(await inventaireService.findInventory("11", null), err("notAllowed"));
    assert.strictEqual(inventoryRepository.findInventoryById.mock.callCount(), 0);
  });
});

describe("Find inventory by data ID", () => {
  test("should handle inventory found", async () => {
    const inventoryData = inventoryFactory.build();
    const loggedUser = loggedUserFactory.build();

    inventoryRepository.findInventoryByEntryId.mock.mockImplementationOnce(() => Promise.resolve(inventoryData));

    const inventory = await inventaireService.findInventoryOfEntryId("43", loggedUser);

    assert.strictEqual(inventoryRepository.findInventoryByEntryId.mock.callCount(), 1);
    assert.deepStrictEqual(inventoryRepository.findInventoryByEntryId.mock.calls[0].arguments, ["43"]);
    assert.deepStrictEqual(inventory, ok(inventoryData));
  });

  test("should not be allowed when the requester is not logged", async () => {
    assert.deepStrictEqual(await inventaireService.findInventoryOfEntryId("12", null), err("notAllowed"));
  });
});

test("Find all inventaries", async () => {
  const inventariesData = inventoryFactory.buildList(3);

  inventoryRepository.findInventories.mock.mockImplementationOnce(() => Promise.resolve(inventariesData));

  await inventaireService.findAllInventories();

  assert.strictEqual(inventoryRepository.findInventories.mock.callCount(), 1);
});

describe("Inventories paginated find by search criteria", () => {
  test("should handle params when retrieving paginated inventories", async () => {
    const inventoriesData = inventoryFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: InventoriesSearchParams = {
      orderBy: "creationDate",
      sortOrder: "desc",
      pageNumber: 1,
      pageSize: 10,
    };

    inventoryRepository.findInventories.mock.mockImplementationOnce(() => Promise.resolve([inventoriesData[0]]));

    await inventaireService.findPaginatedInventories(loggedUser, searchParams);

    assert.strictEqual(inventoryRepository.findInventories.mock.callCount(), 1);
    assert.deepStrictEqual(inventoryRepository.findInventories.mock.calls[0].arguments, [
      {
        orderBy: "creationDate",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    assert.deepStrictEqual(
      await inventaireService.findPaginatedInventories(null, {
        pageNumber: 1,
        pageSize: 10,
      }),
      err("notAllowed"),
    );
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await inventaireService.getInventoriesCount(loggedUser);

    assert.strictEqual(inventoryRepository.getCount.mock.callCount(), 1);
  });

  test("should not be allowed when the requester is not logged", async () => {
    assert.deepStrictEqual(await inventaireService.getInventoriesCount(null), err("notAllowed"));
  });
});

describe("Update of an inventory", () => {
  describe("to values already matching an existing inventory", () => {
    test("should return the correct state if no migration requested", async () => {
      const inventoryData = upsertInventoryInputFactory.build({
        migrateDonneesIfMatchesExistingInventaire: undefined,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));
      inventoryRepository.findExistingInventory.mock.mockImplementationOnce(() =>
        Promise.resolve(inventoryFactory.build({ id: "345" })),
      );

      assert.deepStrictEqual(
        await inventaireService.updateInventory("12", inventoryData, loggedUser),
        err({ type: "similarInventoryAlreadyExists", correspondingInventoryFound: "345" }),
      );

      assert.strictEqual(entryRepository.updateAssociatedInventory.mock.callCount(), 0);
      assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 0);
    });

    test("should handle migration of existing data if requested", async () => {
      const inventoryData = upsertInventoryInputFactory.build({
        migrateDonneesIfMatchesExistingInventaire: true,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));
      inventoryRepository.findExistingInventory.mock.mockImplementationOnce(() =>
        Promise.resolve(inventoryFactory.build({ id: "345" })),
      );

      const result = await inventaireService.updateInventory("12", inventoryData, loggedUser);

      assert.strictEqual(entryRepository.updateAssociatedInventory.mock.callCount(), 1);
      assert.deepStrictEqual(entryRepository.updateAssociatedInventory.mock.calls[0].arguments, ["12", "345"]);
      assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 1);
      assert.deepStrictEqual(inventoryRepository.deleteInventoryById.mock.calls[0].arguments, ["12"]);
      assert.ok(result.isOk());
      assert.strictEqual(result.value.id, "345");
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = upsertInventoryInputFactory.build();

      assert.deepStrictEqual(
        await inventaireService.updateInventory("12", inventoryData, null),
        err({ type: "notAllowed" }),
      );
      assert.strictEqual(inventoryRepository.findExistingInventory.mock.callCount(), 0);
    });
  });

  describe("to values not matching an existing inventory", () => {
    test("should update an inventory", async () => {
      const inventoryData = upsertInventoryInputFactory.build({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
      });
      const { coordinates, duration, migrateDonneesIfMatchesExistingInventaire, ...restInventoryData } = inventoryData;

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));
      inventoryRepository.findExistingInventory.mock.mockImplementationOnce(() => Promise.resolve(null));
      inventoryRepository.updateInventory.mock.mockImplementationOnce(() =>
        Promise.resolve(inventoryFactory.build({ id: "12" })),
      );

      await inventaireService.updateInventory("12", inventoryData, loggedUser);

      assert.strictEqual(inventoryRepository.updateInventory.mock.callCount(), 1);
      assert.deepStrictEqual(inventoryRepository.updateInventory.mock.calls[0].arguments, [
        "12",
        {
          ...restInventoryData,
          duration: duration ? getHumanFriendlyTimeFromMinutes(duration) : null,
          customizedCoordinates: coordinates,
        },
      ]);
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = upsertInventoryInputFactory.build();

      assert.deepStrictEqual(
        await inventaireService.updateInventory("12", inventoryData, null),
        err({ type: "notAllowed" }),
      );
      assert.strictEqual(inventoryRepository.findExistingInventory.mock.callCount(), 0);
    });
  });
});

describe("Creation of an inventory", () => {
  describe("with values already matching an existing inventory", () => {
    test("should return the existing inventory", async () => {
      const inventoryData = upsertInventoryInputFactory.build({
        duration: null,
      });

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));
      inventoryRepository.findExistingInventory.mock.mockImplementationOnce(() =>
        Promise.resolve(inventoryFactory.build({ id: "345" })),
      );

      const result = await inventaireService.createInventory(inventoryData, loggedUser);

      assert.strictEqual(entryRepository.updateAssociatedInventory.mock.callCount(), 0);
      assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 0);
      assert.ok(result.isOk());
      assert.strictEqual(result.value.id, "345");
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = upsertInventoryInputFactory.build();

      assert.deepStrictEqual(await inventaireService.createInventory(inventoryData, null), err("notAllowed"));
      assert.strictEqual(inventoryRepository.findExistingInventory.mock.callCount(), 0);
    });
  });

  describe("with values not matching an existing inventory", () => {
    test("should create new inventory", async () => {
      const inventoryData = upsertInventoryInputFactory.build({
        associateIds: ["2", "3"],
        weatherIds: ["4", "5"],
        duration: null,
      });
      const { coordinates, migrateDonneesIfMatchesExistingInventaire, ...restInventoryData } = inventoryData;

      const loggedUser = loggedUserFactory.build();

      localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));
      inventoryRepository.findExistingInventory.mock.mockImplementationOnce(() => Promise.resolve(null));
      inventoryRepository.createInventory.mock.mockImplementationOnce(() =>
        Promise.resolve(inventoryFactory.build({ id: "322" })),
      );

      await inventaireService.createInventory(inventoryData, loggedUser);

      assert.strictEqual(inventoryRepository.createInventory.mock.callCount(), 1);
      assert.deepStrictEqual(inventoryRepository.createInventory.mock.calls[0].arguments, [
        {
          ...restInventoryData,
          customizedCoordinates: coordinates,
          ownerId: loggedUser.id,
        },
      ]);
    });

    test("should not be allowed when the requester is not logged", async () => {
      const inventoryData = upsertInventoryInputFactory.build();

      assert.deepStrictEqual(await inventaireService.createInventory(inventoryData, null), err("notAllowed"));
      assert.strictEqual(inventoryRepository.findExistingInventory.mock.callCount(), 0);
    });
  });
});

describe("Deletion of an inventory", () => {
  test("when deletion of inventory is done by someone with permission", async () => {
    const loggedUser = loggedUserFactory.build({
      permissions: { canManageAllEntries: true },
    });

    const inventory = inventoryFactory.build();

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));
    inventoryRepository.getEntriesCountById.mock.mockImplementationOnce(() => Promise.resolve(0));
    inventoryRepository.deleteInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));

    const result = await inventaireService.deleteInventory("11", loggedUser);

    assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 1);
    assert.deepStrictEqual(result, ok(inventory));
  });

  test("when deletion of inventory is done by a non-admin owner", async () => {
    const loggedUser = loggedUserFactory.build();

    const inventory = inventoryFactory.build({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));
    inventoryRepository.getEntriesCountById.mock.mockImplementationOnce(() => Promise.resolve(0));
    inventoryRepository.deleteInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));

    const result = await inventaireService.deleteInventory("11", loggedUser);

    assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 1);
    assert.deepStrictEqual(result, ok(inventory));
  });

  test("should not be allowed when trying to delete an inventory still used", async () => {
    const loggedUser = loggedUserFactory.build();

    const inventory = inventoryFactory.build({
      ownerId: loggedUser.id,
    });

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));
    inventoryRepository.getEntriesCountById.mock.mockImplementationOnce(() => Promise.resolve(3));
    inventoryRepository.deleteInventoryById.mock.mockImplementationOnce(() => Promise.resolve(inventory));

    assert.deepStrictEqual(await inventaireService.deleteInventory("11", loggedUser), err("inventoryStillInUse"));
    assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 0);
  });

  test("should not be allowed when trying to delete an inventory belonging to a non-owned inventory", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "notOwner",
    });

    inventoryRepository.findInventoryById.mock.mockImplementationOnce(() =>
      Promise.resolve(inventoryFactory.build({ id: "owner" })),
    );

    assert.deepStrictEqual(await inventaireService.deleteInventory("11", loggedUser), err("notAllowed"));
    assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    assert.deepStrictEqual(await inventaireService.deleteInventory("11", null), err("notAllowed"));
    assert.strictEqual(inventoryRepository.deleteInventoryById.mock.callCount(), 0);
  });
});
