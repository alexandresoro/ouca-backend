import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { townCreateInputFactory, townFactory } from "@fixtures/domain/town/town.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertTownInputFactory } from "@fixtures/services/town/town-service.fixtures.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { TownRepository } from "@interfaces/town-repository-interface.js";
import type { TownsSearchParams } from "@ou-ca/common/api/town.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildTownService } from "./town-service.js";

const townRepository = mock<TownRepository>();
const localityRepository = mock<LocalityRepository>();

const townService = buildTownService({
  townRepository,
  localityRepository,
});

beforeEach(() => {
  townRepository.findTownById.mockReset();
  townRepository.findTowns.mockReset();
  townRepository.updateTown.mockReset();
  townRepository.createTown.mockReset();
  townRepository.createTowns.mockReset();
  townRepository.deleteTownById.mockReset();
  townRepository.getCount.mockReset();
  townRepository.getEntriesCountById.mockReset();
  townRepository.findTownByLocalityId.mockReset();
  localityRepository.getCount.mockReset();
});

describe("Find city", () => {
  test("should handle a matching city", async () => {
    const cityData = townFactory.build();
    const loggedUser = loggedUserFactory.build();

    townRepository.findTownById.mockImplementationOnce(() => Promise.resolve(cityData));

    await townService.findTown(12, loggedUser);

    assert.strictEqual(townRepository.findTownById.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.findTownById.mock.calls[0], [12]);
  });

  test("should handle city not found", async () => {
    townRepository.findTownById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await townService.findTown(10, loggedUser), ok(null));

    assert.strictEqual(townRepository.findTownById.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.findTownById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await townService.findTown(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(townRepository.findTownById.mock.calls.length, 0);
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getLocalitiesCountByTown("12", loggedUser);

    assert.strictEqual(localityRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(localityRepository.getCount.mock.calls[0], [undefined, "12"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await townService.getLocalitiesCountByTown("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getEntriesCountByTown("12", loggedUser);

    assert.strictEqual(townRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.getEntriesCountById.mock.calls[0], ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await townService.getEntriesCountByTown("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

describe("Find city by locality ID", () => {
  test("should handle a found city", async () => {
    const cityData = townFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    townRepository.findTownByLocalityId.mockImplementationOnce(() => Promise.resolve(cityData));

    const townResult = await townService.findTownOfLocalityId("43", loggedUser);

    assert.strictEqual(townRepository.findTownByLocalityId.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.findTownByLocalityId.mock.calls[0], ["43"]);
    assert.ok(townResult.isOk());
    assert.strictEqual(townResult.value?.id, cityData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await townService.findTownOfLocalityId("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all cities", async () => {
  const citiesData = townFactory.buildList(3);

  townRepository.findTowns.mockImplementationOnce(() => Promise.resolve(citiesData));

  await townService.findAllTowns();

  assert.strictEqual(townRepository.findTowns.mock.calls.length, 1);
  assert.deepStrictEqual(townRepository.findTowns.mock.calls[0], [
    {
      orderBy: "nom",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const citiesData = townFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    townRepository.findTowns.mockImplementationOnce(() => Promise.resolve(citiesData));

    await townService.findPaginatedTowns(loggedUser, {});

    assert.strictEqual(townRepository.findTowns.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.findTowns.mock.calls[0], [
      {
        departmentId: undefined,
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
      },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated cities", async () => {
    const citiesData = townFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: TownsSearchParams = {
      orderBy: "nom",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    townRepository.findTowns.mockImplementationOnce(() => Promise.resolve([citiesData[0]]));

    await townService.findPaginatedTowns(loggedUser, searchParams);

    assert.strictEqual(townRepository.findTowns.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.findTowns.mock.calls[0], [
      {
        departmentId: undefined,
        q: "Bob",
        orderBy: "nom",
        sortOrder: "desc",
        offset: 0,
        limit: 10,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await townService.findPaginatedTowns(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getTownsCount(loggedUser, {});

    assert.strictEqual(townRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.getCount.mock.calls[0], [undefined, undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await townService.getTownsCount(loggedUser, { q: "test", departmentId: "12" });

    assert.strictEqual(townRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.getCount.mock.calls[0], ["test", "12"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await townService.getTownsCount(null, {});

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a city", () => {
  test("should be allowed when user has permission", async () => {
    const cityData = upsertTownInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { town: { canEdit: true } } });

    townRepository.updateTown.mockImplementationOnce(() => Promise.resolve(ok(townFactory.build())));

    await townService.updateTown(12, cityData, loggedUser);

    assert.strictEqual(townRepository.updateTown.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.updateTown.mock.calls[0], [12, cityData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = townFactory.build({
      ownerId: "notAdmin",
    });

    const cityData = upsertTownInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    townRepository.findTownById.mockImplementationOnce(() => Promise.resolve(existingData));
    townRepository.updateTown.mockImplementationOnce(() => Promise.resolve(ok(townFactory.build())));

    await townService.updateTown(12, cityData, loggedUser);

    assert.strictEqual(townRepository.updateTown.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.updateTown.mock.calls[0], [12, cityData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = townFactory.build({
      ownerId: "notAdmin",
    });

    const cityData = upsertTownInputFactory.build();

    const user = loggedUserFactory.build();

    townRepository.findTownById.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await townService.updateTown(12, cityData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(townRepository.updateTown.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to a city that exists", async () => {
    const cityData = upsertTownInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { town: { canEdit: true } } });

    townRepository.updateTown.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await townService.updateTown(12, cityData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(townRepository.updateTown.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.updateTown.mock.calls[0], [12, cityData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const cityData = upsertTownInputFactory.build();

    const updateResult = await townService.updateTown(12, cityData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(townRepository.updateTown.mock.calls.length, 0);
  });
});

describe("Creation of a city", () => {
  test("should create new city", async () => {
    const cityData = upsertTownInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { town: { canCreate: true } } });

    townRepository.createTown.mockImplementationOnce(() => Promise.resolve(ok(townFactory.build())));

    await townService.createTown(cityData, loggedUser);

    assert.strictEqual(townRepository.createTown.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.createTown.mock.calls[0], [
      {
        ...cityData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a city that already exists", async () => {
    const cityData = upsertTownInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { town: { canCreate: true } } });

    townRepository.createTown.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await townService.createTown(cityData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(townRepository.createTown.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.createTown.mock.calls[0], [
      {
        ...cityData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const cityData = upsertTownInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { town: { canCreate: false } } });

    const createResult = await townService.createTown(cityData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(townRepository.createTown.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const cityData = upsertTownInputFactory.build();

    const createResult = await townService.createTown(cityData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(townRepository.createTown.mock.calls.length, 0);
  });
});

describe("Deletion of a city", () => {
  test("should handle the deletion of an owned city", async () => {
    const loggedUser = loggedUserFactory.build({ id: "12" });

    const city = townFactory.build({
      ownerId: loggedUser.id,
    });

    townRepository.findTownById.mockImplementationOnce(() => Promise.resolve(city));

    await townService.deleteTown(11, loggedUser);

    assert.strictEqual(townRepository.deleteTownById.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.deleteTownById.mock.calls[0], [11]);
  });

  test("should handle the deletion of any city if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { town: { canDelete: true } } });

    townRepository.findTownById.mockImplementationOnce(() => Promise.resolve(townFactory.build()));

    await townService.deleteTown(11, loggedUser);

    assert.strictEqual(townRepository.deleteTownById.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.deleteTownById.mock.calls[0], [11]);
  });

  test("should not be allowed when deleting a non-owned city and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { town: { canDelete: false } } });

    townRepository.findTownById.mockImplementationOnce(() => Promise.resolve(townFactory.build()));

    const deleteResult = await townService.deleteTown(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(townRepository.deleteTownById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { town: { canDelete: true } } });

    localityRepository.getCount.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await townService.deleteTown(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(townRepository.deleteTownById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await townService.deleteTown(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(townRepository.deleteTownById.mock.calls.length, 0);
  });
});

test("Create multiple cities", async () => {
  const townsData = townCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  townRepository.createTowns.mockImplementationOnce(() => Promise.resolve([]));

  await townService.createTowns(townsData, loggedUser);

  assert.strictEqual(townRepository.createTowns.mock.calls.length, 1);
  assert.deepStrictEqual(townRepository.createTowns.mock.calls[0], [
    townsData.map((town) => {
      return {
        ...town,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
