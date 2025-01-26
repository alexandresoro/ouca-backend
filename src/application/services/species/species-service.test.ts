import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { speciesClassFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { speciesCreateInputFactory, speciesFactory } from "@fixtures/domain/species/species.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSpeciesInputFactory } from "@fixtures/services/species/species-service.fixtures.js";
import type { SpeciesRepository } from "@interfaces/species-repository-interface.js";
import type { SpeciesSearchParams } from "@ou-ca/common/api/species.js";
import { err, ok } from "neverthrow";
import type { SpeciesClassService } from "../../../application/services/species-class/species-class-service.js";
import { mock } from "../../../utils/mock.js";
import { buildSpeciesService } from "./species-service.js";

const classService = mock<SpeciesClassService>();
const speciesRepository = mock<SpeciesRepository>();

const speciesService = buildSpeciesService({
  classService,
  speciesRepository,
});

beforeEach(() => {
  speciesRepository.findSpeciesById.mockReset();
  speciesRepository.findSpecies.mockReset();
  speciesRepository.updateSpecies.mockReset();
  speciesRepository.createSpecies.mockReset();
  speciesRepository.deleteSpeciesById.mockReset();
  speciesRepository.createSpeciesMultiple.mockReset();
  speciesRepository.getCount.mockReset();
  speciesRepository.getEntriesCountById.mockReset();
  classService.findSpeciesClassOfSpecies.mockReset();
});

describe("Find species", () => {
  test("should handle a matching species", async () => {
    const speciesData = speciesFactory.build();
    const loggedUser = loggedUserFactory.build();

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpeciesById.mockImplementationOnce(() => Promise.resolve(speciesData));

    await speciesService.findSpecies(12, loggedUser);

    assert.strictEqual(speciesRepository.findSpeciesById.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.findSpeciesById.mock.calls[0], [12]);
  });

  test("should handle species not found", async () => {
    speciesRepository.findSpeciesById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await speciesService.findSpecies(10, loggedUser), ok(null));

    assert.strictEqual(speciesRepository.findSpeciesById.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.findSpeciesById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await speciesService.findSpecies(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.findSpeciesById.mock.calls.length, 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEntriesCountBySpecies("12", {}, loggedUser);

    assert.strictEqual(speciesRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.getEntriesCountById.mock.calls[0], ["12", {}, loggedUser.id]);
  });

  test("should request the correct parameters if all users requested", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getEntriesCountBySpecies("12", {}, loggedUser, true);

    assert.strictEqual(speciesRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.getEntriesCountById.mock.calls[0], ["12", {}, undefined]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesService.getEntriesCountBySpecies("12", {}, null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.getEntriesCountById.mock.calls.length, 0);
  });
});

test("Find all species", async () => {
  const speciesData = speciesFactory.buildList(3);
  const loggedUser = loggedUserFactory.build();

  const speciesClass = speciesClassFactory.build();
  classService.findSpeciesClassOfSpecies.mockImplementation(() =>
    Promise.resolve(ok({ ...speciesClass, editable: true })),
  );

  speciesRepository.findSpecies.mockImplementationOnce(() => Promise.resolve(speciesData));

  await speciesService.findAllSpecies(loggedUser);

  assert.strictEqual(speciesRepository.findSpecies.mock.calls.length, 1);
  assert.deepStrictEqual(speciesRepository.findSpecies.mock.calls[0], [
    {
      orderBy: "code",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mockImplementation(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpecies.mockImplementationOnce(() => Promise.resolve(speciesData));

    await speciesService.findPaginatedSpecies(loggedUser, {});

    assert.strictEqual(speciesRepository.findSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.findSpecies.mock.calls[0], [
      {
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
        searchCriteria: {},
      },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated species", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SpeciesSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mockImplementation(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpecies.mockImplementationOnce(() => Promise.resolve([speciesData[0]]));

    await speciesService.findPaginatedSpecies(loggedUser, searchParams);

    assert.strictEqual(speciesRepository.findSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.findSpecies.mock.calls[0], [
      {
        q: "Bob",
        orderBy: "code",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
        searchCriteria: {},
      },
      loggedUser.id,
    ]);
  });

  test("should handle params and search criteria when retrieving paginated species", async () => {
    const speciesData = speciesFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: SpeciesSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    };

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpecies.mockImplementationOnce(() => Promise.resolve([speciesData[0]]));

    await speciesService.findPaginatedSpecies(loggedUser, searchParams);

    assert.strictEqual(speciesRepository.findSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.findSpecies.mock.calls[0], [
      {
        q: "Bob",
        searchCriteria: {
          ageIds: ["12", "23"],
          number: undefined,
          toDate: "2010-01-01",
          townIds: ["3", "6"],
        },
        orderBy: "code",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await speciesService.findPaginatedSpecies(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.findSpecies.mock.calls.length, 0);
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, {});

    assert.strictEqual(speciesRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0], [
      {
        q: undefined,
        searchCriteria: {},
      },
    ]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, { q: "test" });

    assert.strictEqual(speciesRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0], [
      {
        q: "test",
        searchCriteria: {},
      },
    ]);
  });

  test("should handle to be called with some donnee criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, {
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    });

    assert.strictEqual(speciesRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0], [
      {
        q: undefined,
        searchCriteria: {
          ageIds: ["12", "23"],
          number: undefined,
          toDate: "2010-01-01",
          townIds: ["3", "6"],
        },
      },
    ]);
  });

  test("should handle to be called with both espece and donnee criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesService.getSpeciesCount(loggedUser, {
      q: "test",
      ageIds: ["12", "23"],
      number: undefined,
      townIds: ["3", "6"],
      toDate: "2010-01-01",
    });

    assert.strictEqual(speciesRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0], [
      {
        q: "test",
        searchCriteria: {
          ageIds: ["12", "23"],
          number: undefined,
          toDate: "2010-01-01",
          townIds: ["3", "6"],
        },
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesService.getSpeciesCount(null, {});

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.getCount.mock.calls.length, 0);
  });
});

describe("Update of a species", () => {
  test("should be allowed when user has permission", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { species: { canEdit: true } } });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateSpecies.mockImplementationOnce(() => Promise.resolve(ok(species)));

    await speciesService.updateSpecies(12, speciesData, loggedUser);

    assert.strictEqual(speciesRepository.updateSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.updateSpecies.mock.calls[0], [12, speciesData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesFactory.build({
      ownerId: "notAdmin",
    });

    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    speciesRepository.findSpeciesById.mockImplementationOnce(() => Promise.resolve(existingData));

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.updateSpecies.mockImplementationOnce(() => Promise.resolve(ok(species)));

    await speciesService.updateSpecies(12, speciesData, loggedUser);

    assert.strictEqual(speciesRepository.updateSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.updateSpecies.mock.calls[0], [12, speciesData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = speciesFactory.build({
      ownerId: "notAdmin",
    });

    const speciesData = upsertSpeciesInputFactory.build();

    const user = loggedUserFactory.build();

    speciesRepository.findSpeciesById.mockImplementationOnce(() => Promise.resolve(existingData));

    assert.deepStrictEqual(await speciesService.updateSpecies(12, speciesData, user), err("notAllowed"));

    assert.strictEqual(speciesRepository.updateSpecies.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to a species that exists", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { species: { canEdit: true } } });

    speciesRepository.updateSpecies.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    assert.deepStrictEqual(await speciesService.updateSpecies(12, speciesData, loggedUser), err("alreadyExists"));

    assert.strictEqual(speciesRepository.updateSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.updateSpecies.mock.calls[0], [12, speciesData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const updateResult = await speciesService.updateSpecies(12, speciesData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.updateSpecies.mock.calls.length, 0);
  });
});

describe("Creation of a species", () => {
  test("should create new species", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { species: { canCreate: true } } });

    const speciesClass = speciesClassFactory.build();
    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );

    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });
    speciesRepository.createSpecies.mockImplementationOnce(() => Promise.resolve(ok(species)));

    await speciesService.createSpecies(speciesData, loggedUser);

    assert.strictEqual(speciesRepository.createSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.createSpecies.mock.calls[0], [
      {
        ...speciesData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a species that already exists", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { species: { canCreate: true } } });

    speciesRepository.createSpecies.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    assert.deepStrictEqual(await speciesService.createSpecies(speciesData, loggedUser), err("alreadyExists"));

    assert.strictEqual(speciesRepository.createSpecies.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.createSpecies.mock.calls[0], [
      {
        ...speciesData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { species: { canCreate: false } } });

    const createResult = await speciesService.createSpecies(speciesData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.createSpecies.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesData = upsertSpeciesInputFactory.build();

    const createResult = await speciesService.createSpecies(speciesData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.createSpecies.mock.calls.length, 0);
  });
});

describe("Deletion of a species", () => {
  test("should handle the deletion of an owned species", async () => {
    const loggedUser = loggedUserFactory.build({ id: "12" });

    const speciesClass = speciesClassFactory.build();
    const species = speciesFactory.build({
      ownerId: loggedUser.id,
    });

    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    speciesRepository.findSpeciesById.mockImplementationOnce(() => Promise.resolve(species));

    await speciesService.deleteSpecies(11, loggedUser);

    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.deleteSpeciesById.mock.calls[0], [11]);
  });

  test("should handle the deletion of any species if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { species: { canDelete: true } } });

    const speciesClass = speciesClassFactory.build();

    classService.findSpeciesClassOfSpecies.mockImplementationOnce(() =>
      Promise.resolve(ok({ ...speciesClass, editable: true })),
    );
    speciesRepository.findSpeciesById.mockImplementationOnce(() => Promise.resolve(speciesFactory.build()));

    await speciesService.deleteSpecies(11, loggedUser);

    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.calls.length, 1);
    assert.deepStrictEqual(speciesRepository.deleteSpeciesById.mock.calls[0], [11]);
  });

  test("should not be allowed when deleting a non-owned species and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { species: { canDelete: false } } });

    speciesRepository.findSpeciesById.mockImplementationOnce(() => Promise.resolve(speciesFactory.build()));

    assert.deepStrictEqual(await speciesService.deleteSpecies(11, loggedUser), err("notAllowed"));

    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { species: { canDelete: true } } });

    speciesRepository.getEntriesCountById.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await speciesService.deleteSpecies(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await speciesService.deleteSpecies(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(speciesRepository.deleteSpeciesById.mock.calls.length, 0);
  });
});

test("Create multiple species", async () => {
  const speciesData = speciesCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  speciesRepository.createSpeciesMultiple.mockImplementationOnce(() => Promise.resolve([]));

  await speciesService.createMultipleSpecies(speciesData, loggedUser);

  assert.strictEqual(speciesRepository.createSpeciesMultiple.mock.calls.length, 1);
  assert.deepStrictEqual(speciesRepository.createSpeciesMultiple.mock.calls[0], [
    speciesData.map((species) => {
      return {
        ...species,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
