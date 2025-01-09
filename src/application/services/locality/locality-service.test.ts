import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { localityFactory } from "@fixtures/domain/locality/locality.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertLocalityInputFactory } from "@fixtures/services/locality/locality-service.fixtures.js";
import type { InventoryRepository } from "@interfaces/inventory-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { LocalitiesSearchParams } from "@ou-ca/common/api/locality.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildLocalityService } from "./locality-service.js";

const localityRepository = mock<LocalityRepository>();
const inventoryRepository = mock<InventoryRepository>();

const localityService = buildLocalityService({
  localityRepository,
  inventoryRepository,
});

beforeEach(() => {
  localityRepository.findLocalityById.mock.resetCalls();
  localityRepository.findLocalityByInventoryId.mock.resetCalls();
  localityRepository.findLocalities.mock.resetCalls();
  localityRepository.getCount.mock.resetCalls();
  localityRepository.getEntriesCountById.mock.resetCalls();
  localityRepository.updateLocality.mock.resetCalls();
  localityRepository.createLocality.mock.resetCalls();
  localityRepository.deleteLocalityById.mock.resetCalls();
  localityRepository.createLocalities.mock.resetCalls();
  inventoryRepository.getCountByLocality.mock.resetCalls();
});

describe("Find locality", () => {
  test("should handle a matching locality", async () => {
    const localityData = localityFactory.build();
    const loggedUser = loggedUserFactory.build();

    localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityData));

    await localityService.findLocality(12, loggedUser);

    assert.strictEqual(localityRepository.findLocalityById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLocalityById.mock.calls[0].arguments, [12]);
  });

  test("should handle locality not found", async () => {
    localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await localityService.findLocality(10, loggedUser), ok(null));

    assert.strictEqual(localityRepository.findLocalityById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLocalityById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await localityService.findLocality(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(localityRepository.findLocalityById.mock.callCount(), 0);
  });
});

describe("Inventory count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getInventoriesCountByLocality("12", loggedUser);

    assert.strictEqual(inventoryRepository.getCountByLocality.mock.callCount(), 1);
    assert.deepStrictEqual(inventoryRepository.getCountByLocality.mock.calls[0].arguments, ["12"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const inventoriesCountResult = await localityService.getInventoriesCountByLocality("12", null);

    assert.deepStrictEqual(inventoriesCountResult, err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getEntriesCountByLocality("12", loggedUser);

    assert.strictEqual(localityRepository.getEntriesCountById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.getEntriesCountById.mock.calls[0].arguments, ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await localityService.getEntriesCountByLocality("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Find locality by inventary ID", () => {
  test("should handle locality found", async () => {
    const localityData = localityFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    localityRepository.findLocalityByInventoryId.mock.mockImplementationOnce(() => Promise.resolve(localityData));

    const localityResult = await localityService.findLocalityOfInventoryId("43", loggedUser);

    assert.strictEqual(localityRepository.findLocalityByInventoryId.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLocalityByInventoryId.mock.calls[0].arguments, ["43"]);
    assert.ok(localityResult.isOk());
    assert.strictEqual(localityResult.value?.id, localityData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await localityService.findLocalityOfInventoryId("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all localities", async () => {
  const localitiesData = localityFactory.buildList(3);

  localityRepository.findLocalities.mock.mockImplementationOnce(() => Promise.resolve(localitiesData));

  await localityService.findAllLocalities();

  assert.strictEqual(localityRepository.findLocalities.mock.callCount(), 1);
  assert.deepStrictEqual(localityRepository.findLocalities.mock.calls[0].arguments, [
    {
      orderBy: "nom",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const localitiesData = localityFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    localityRepository.findLocalities.mock.mockImplementationOnce(() => Promise.resolve(localitiesData));

    await localityService.findPaginatedLocalities(loggedUser, {});

    assert.strictEqual(localityRepository.findLocalities.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLocalities.mock.calls[0].arguments, [
      {
        q: undefined,
        orderBy: undefined,
        sortOrder: undefined,
        offset: undefined,
        limit: undefined,
        townId: undefined,
      },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated localities", async () => {
    const localitiesData = localityFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: LocalitiesSearchParams = {
      orderBy: "nom",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    localityRepository.findLocalities.mock.mockImplementationOnce(() => Promise.resolve([localitiesData[0]]));

    await localityService.findPaginatedLocalities(loggedUser, searchParams);

    assert.strictEqual(localityRepository.findLocalities.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.findLocalities.mock.calls[0].arguments, [
      {
        q: "Bob",
        orderBy: "nom",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
        townId: undefined,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await localityService.findPaginatedLocalities(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getLocalitiesCount(loggedUser, {});

    assert.strictEqual(localityRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.getCount.mock.calls[0].arguments, [undefined, undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await localityService.getLocalitiesCount(loggedUser, { q: "test", townId: "12" });

    assert.strictEqual(localityRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.getCount.mock.calls[0].arguments, ["test", "12"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await localityService.getLocalitiesCount(null, {});

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a locality", () => {
  test("should be allowed when user has permission", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canEdit: true } } });

    localityRepository.updateLocality.mock.mockImplementationOnce(() => Promise.resolve(ok(localityFactory.build())));

    await localityService.updateLocality(12, localityData, loggedUser);

    assert.strictEqual(localityRepository.updateLocality.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.updateLocality.mock.calls[0].arguments, [12, localityData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = localityFactory.build({
      ownerId: "notAdmin",
    });

    const localityData = upsertLocalityInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(existingData));
    localityRepository.updateLocality.mock.mockImplementationOnce(() => Promise.resolve(ok(localityFactory.build())));

    await localityService.updateLocality(12, localityData, loggedUser);

    assert.strictEqual(localityRepository.updateLocality.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.updateLocality.mock.calls[0].arguments, [12, localityData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = localityFactory.build({
      ownerId: "notAdmin",
    });

    const localityData = upsertLocalityInputFactory.build();

    const user = loggedUserFactory.build();

    localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    assert.deepStrictEqual(await localityService.updateLocality(12, localityData, user), err("notAllowed"));

    assert.strictEqual(localityRepository.updateLocality.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a locality that exists", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canEdit: true } } });

    localityRepository.updateLocality.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    assert.deepStrictEqual(await localityService.updateLocality(12, localityData, loggedUser), err("alreadyExists"));

    assert.strictEqual(localityRepository.updateLocality.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.updateLocality.mock.calls[0].arguments, [12, localityData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const updateResult = await localityService.updateLocality(12, localityData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
  });
});

describe("Creation of a locality", () => {
  test("should create new locality", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canCreate: true } } });

    localityRepository.createLocality.mock.mockImplementationOnce(() => Promise.resolve(ok(localityFactory.build())));

    await localityService.createLocality(localityData, loggedUser);

    assert.strictEqual(localityRepository.createLocality.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.createLocality.mock.calls[0].arguments, [
      {
        ...localityData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a locality that already exists", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canCreate: true } } });

    localityRepository.createLocality.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    assert.deepStrictEqual(await localityService.createLocality(localityData, loggedUser), err("alreadyExists"));

    assert.strictEqual(localityRepository.createLocality.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.createLocality.mock.calls[0].arguments, [
      {
        ...localityData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canCreate: false } } });

    const createResult = await localityService.createLocality(localityData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
  });

  test("should not be allowed when the requester is not logged", async () => {
    const localityData = upsertLocalityInputFactory.build();

    const createResult = await localityService.createLocality(localityData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
  });
});

describe("Deletion of a locality", () => {
  test("should handle the deletion of an owned locality", async () => {
    const loggedUser = loggedUserFactory.build({ id: "12" });

    const locality = localityFactory.build({
      ownerId: loggedUser.id,
    });

    localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(locality));
    localityRepository.deleteLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    await localityService.deleteLocality(11, loggedUser);

    assert.strictEqual(localityRepository.deleteLocalityById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.deleteLocalityById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any locality if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canDelete: true } } });

    localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));
    localityRepository.deleteLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    await localityService.deleteLocality(11, loggedUser);

    assert.strictEqual(localityRepository.deleteLocalityById.mock.callCount(), 1);
    assert.deepStrictEqual(localityRepository.deleteLocalityById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned locality and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canDelete: false } } });

    localityRepository.findLocalityById.mock.mockImplementationOnce(() => Promise.resolve(localityFactory.build()));

    assert.deepStrictEqual(await localityService.deleteLocality(11, loggedUser), err("notAllowed"));

    assert.strictEqual(localityRepository.deleteLocalityById.mock.callCount(), 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { locality: { canDelete: true } } });

    inventoryRepository.getCountByLocality.mock.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await localityService.deleteLocality(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(localityRepository.deleteLocalityById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await localityService.deleteLocality(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
  });
});

test("Create multiple localities", async () => {
  const localitiesData = upsertLocalityInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  localityRepository.createLocalities.mock.mockImplementationOnce(() => Promise.resolve([]));

  await localityService.createLocalities(localitiesData, loggedUser);

  assert.strictEqual(localityRepository.createLocalities.mock.callCount(), 1);
  assert.deepStrictEqual(localityRepository.createLocalities.mock.calls[0].arguments, [
    localitiesData.map((locality) => {
      return {
        ...locality,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
