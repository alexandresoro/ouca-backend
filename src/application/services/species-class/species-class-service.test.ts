import assert from "node:assert/strict";
import test, { describe, beforeEach } from "node:test";
import { speciesClassFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertSpeciesClassInputFactory } from "@fixtures/services/species-class/species-class-service.fixtures.js";
import type { SpeciesClassRepository } from "@interfaces/species-class-repository-interface.js";
import type { SpeciesRepository } from "@interfaces/species-repository-interface.js";
import type { ClassesSearchParams } from "@ou-ca/common/api/species-class.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildSpeciesClassService } from "./species-class-service.js";

const classRepository = mock<SpeciesClassRepository>();
const speciesRepository = mock<SpeciesRepository>();

const speciesClassService = buildSpeciesClassService({
  classRepository,
  speciesRepository,
});

beforeEach(() => {
  classRepository.findSpeciesClassById.mock.resetCalls();
  classRepository.findSpeciesClasses.mock.resetCalls();
  classRepository.getCount.mock.resetCalls();
  classRepository.getEntriesCountById.mock.resetCalls();
  classRepository.createSpeciesClass.mock.resetCalls();
  classRepository.updateSpeciesClass.mock.resetCalls();
  classRepository.deleteSpeciesClassById.mock.resetCalls();
  classRepository.createSpeciesClasses.mock.resetCalls();
  classRepository.findSpeciesClassBySpeciesId.mock.resetCalls();
  speciesRepository.getCount.mock.resetCalls();
});

describe("Find class", () => {
  test("should handle a matching class", async () => {
    const classData = speciesClassFactory.build();
    const loggedUser = loggedUserFactory.build();

    classRepository.findSpeciesClassById.mock.mockImplementationOnce(() => Promise.resolve(classData));

    await speciesClassService.findSpeciesClass(12, loggedUser);

    assert.strictEqual(classRepository.findSpeciesClassById.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.findSpeciesClassById.mock.calls[0].arguments, [12]);
  });

  test("should handle class not found", async () => {
    classRepository.findSpeciesClassById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await speciesClassService.findSpeciesClass(10, loggedUser), ok(null));

    assert.strictEqual(classRepository.findSpeciesClassById.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.findSpeciesClassById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await speciesClassService.findSpeciesClass(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(classRepository.findSpeciesClassById.mock.callCount(), 0);
  });
});

describe("Species count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getSpeciesCountBySpeciesClass("12", loggedUser);

    assert.strictEqual(speciesRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(speciesRepository.getCount.mock.calls[0].arguments, [
      {
        searchCriteria: {
          classIds: ["12"],
        },
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const speciesCountResult = await speciesClassService.getSpeciesCountBySpeciesClass("12", null);

    assert.deepStrictEqual(speciesCountResult, err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getEntriesCountBySpeciesClass("12", loggedUser);

    assert.strictEqual(classRepository.getEntriesCountById.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.getEntriesCountById.mock.calls[0].arguments, ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesClassService.getEntriesCountBySpeciesClass("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Find class by species ID", () => {
  test("should handle a found class", async () => {
    const classData = speciesClassFactory.build();
    const loggedUser = loggedUserFactory.build();

    classRepository.findSpeciesClassBySpeciesId.mock.mockImplementationOnce(() => Promise.resolve(classData));

    const speciesClassResult = await speciesClassService.findSpeciesClassOfSpecies("43", loggedUser);

    assert.strictEqual(classRepository.findSpeciesClassBySpeciesId.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.findSpeciesClassBySpeciesId.mock.calls[0].arguments, [43]);
    assert.ok(speciesClassResult.isOk());
    assert.strictEqual(speciesClassResult.value?.id, classData.id);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await speciesClassService.findSpeciesClassOfSpecies("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all classes", async () => {
  const classesData = speciesClassFactory.buildList(3);

  classRepository.findSpeciesClasses.mock.mockImplementationOnce(() => Promise.resolve(classesData));

  await speciesClassService.findAllSpeciesClasses();

  assert.strictEqual(classRepository.findSpeciesClasses.mock.callCount(), 1);
  assert.deepStrictEqual(classRepository.findSpeciesClasses.mock.calls[0].arguments, [
    {
      orderBy: "libelle",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const classesData = speciesClassFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    classRepository.findSpeciesClasses.mock.mockImplementationOnce(() => Promise.resolve(classesData));

    await speciesClassService.findPaginatedSpeciesClasses(loggedUser, {});

    assert.strictEqual(classRepository.findSpeciesClasses.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.findSpeciesClasses.mock.calls[0].arguments, [
      { limit: undefined, offset: undefined, orderBy: undefined, q: undefined, sortOrder: undefined },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated classes", async () => {
    const classesData = speciesClassFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: ClassesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    classRepository.findSpeciesClasses.mock.mockImplementationOnce(() => Promise.resolve(classesData));

    await speciesClassService.findPaginatedSpeciesClasses(loggedUser, searchParams);

    assert.strictEqual(classRepository.findSpeciesClasses.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.findSpeciesClasses.mock.calls[0].arguments, [
      {
        q: "Bob",
        orderBy: "libelle",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await speciesClassService.findPaginatedSpeciesClasses(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getSpeciesClassesCount(loggedUser);

    assert.strictEqual(classRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.getCount.mock.calls[0].arguments, [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await speciesClassService.getSpeciesClassesCount(loggedUser, "test");

    assert.strictEqual(classRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.getCount.mock.calls[0].arguments, ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await speciesClassService.getSpeciesClassesCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a class", () => {
  test("should be allowed when user has permission", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canEdit: true } } });

    classRepository.updateSpeciesClass.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(speciesClassFactory.build())),
    );

    await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    assert.strictEqual(classRepository.updateSpeciesClass.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.updateSpeciesClass.mock.calls[0].arguments, [12, classData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = speciesClassFactory.build({
      ownerId: "notAdmin",
    });

    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    classRepository.findSpeciesClassById.mock.mockImplementationOnce(() => Promise.resolve(existingData));
    classRepository.updateSpeciesClass.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(speciesClassFactory.build())),
    );

    await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    assert.strictEqual(classRepository.updateSpeciesClass.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.updateSpeciesClass.mock.calls[0].arguments, [12, classData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = speciesClassFactory.build({
      ownerId: "notAdmin",
    });

    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build();

    classRepository.findSpeciesClassById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(classRepository.updateSpeciesClass.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a class that exists", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canEdit: true } } });

    classRepository.updateSpeciesClass.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(classRepository.updateSpeciesClass.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.updateSpeciesClass.mock.calls[0].arguments, [12, classData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const updateResult = await speciesClassService.updateSpeciesClass(12, classData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(classRepository.updateSpeciesClass.mock.callCount(), 0);
  });
});

describe("Creation of a class", () => {
  test("should create new class", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canCreate: true } } });

    classRepository.createSpeciesClass.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(speciesClassFactory.build())),
    );

    await speciesClassService.createSpeciesClass(classData, loggedUser);

    assert.strictEqual(classRepository.createSpeciesClass.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.createSpeciesClass.mock.calls[0].arguments, [
      {
        ...classData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a class that already exists", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canCreate: true } } });

    classRepository.createSpeciesClass.mock.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await speciesClassService.createSpeciesClass(classData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(classRepository.createSpeciesClass.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.createSpeciesClass.mock.calls[0].arguments, [
      {
        ...classData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canCreate: false } } });

    const createResult = await speciesClassService.createSpeciesClass(classData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(classRepository.createSpeciesClass.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const classData = upsertSpeciesClassInputFactory.build();

    const createResult = await speciesClassService.createSpeciesClass(classData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(classRepository.createSpeciesClass.mock.callCount(), 0);
  });
});

describe("Deletion of a class", () => {
  test("should handle the deletion of an owned class", async () => {
    const loggedUser = loggedUserFactory.build({ id: "12" });

    const speciesClass = speciesClassFactory.build({
      ownerId: loggedUser.id,
    });

    classRepository.findSpeciesClassById.mock.mockImplementationOnce(() => Promise.resolve(speciesClass));

    await speciesClassService.deleteSpeciesClass(11, loggedUser);

    assert.strictEqual(classRepository.deleteSpeciesClassById.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.deleteSpeciesClassById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any class if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canDelete: true } } });

    classRepository.findSpeciesClassById.mock.mockImplementationOnce(() =>
      Promise.resolve(speciesClassFactory.build()),
    );

    await speciesClassService.deleteSpeciesClass(11, loggedUser);

    assert.strictEqual(classRepository.deleteSpeciesClassById.mock.callCount(), 1);
    assert.deepStrictEqual(classRepository.deleteSpeciesClassById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned class and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canDelete: false } } });

    classRepository.findSpeciesClassById.mock.mockImplementationOnce(() =>
      Promise.resolve(speciesClassFactory.build()),
    );

    const deleteResult = await speciesClassService.deleteSpeciesClass(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(classRepository.deleteSpeciesClassById.mock.callCount(), 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { speciesClass: { canDelete: true } } });

    speciesRepository.getCount.mock.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await speciesClassService.deleteSpeciesClass(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(classRepository.deleteSpeciesClassById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await speciesClassService.deleteSpeciesClass(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(classRepository.deleteSpeciesClassById.mock.callCount(), 0);
  });
});

test("Create multiple classes", async () => {
  const classesData = upsertSpeciesClassInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  classRepository.createSpeciesClasses.mock.mockImplementationOnce(() => Promise.resolve([]));

  await speciesClassService.createMultipleSpeciesClasses(classesData, loggedUser);

  assert.strictEqual(classRepository.createSpeciesClasses.mock.callCount(), 1);
  assert.deepStrictEqual(classRepository.createSpeciesClasses.mock.calls[0].arguments, [
    classesData.map((speciesClass) => {
      return {
        ...speciesClass,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
