import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { behaviorFactory } from "@fixtures/domain/behavior/behavior.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertBehaviorInputFactory } from "@fixtures/services/behavior/behavior-service.fixtures.js";
import type { BehaviorRepository } from "@interfaces/behavior-repository-interface.js";
import type { BehaviorsSearchParams } from "@ou-ca/common/api/behavior.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildBehaviorService } from "./behavior-service.js";

const behaviorRepository = mock<BehaviorRepository>();

const behaviorService = buildBehaviorService({
  behaviorRepository,
});

beforeEach(() => {
  behaviorRepository.findBehaviorById.mockReset();
  behaviorRepository.findBehaviorsById.mockReset();
  behaviorRepository.findBehaviors.mockReset();
  behaviorRepository.createBehavior.mockReset();
  behaviorRepository.createBehaviors.mockReset();
  behaviorRepository.updateBehavior.mockReset();
  behaviorRepository.deleteBehaviorById.mockReset();
  behaviorRepository.getCount.mockReset();
  behaviorRepository.getEntriesCountById.mockReset();
});

describe("Find behavior", () => {
  test("should handle a matching behavior", async () => {
    const behaviorData = behaviorFactory.build();
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findBehaviorById.mockImplementationOnce(() => Promise.resolve(behaviorData));

    await behaviorService.findBehavior(12, loggedUser);

    assert.strictEqual(behaviorRepository.findBehaviorById.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.findBehaviorById.mock.calls[0], [12]);
  });

  test("should handle behavior not found", async () => {
    behaviorRepository.findBehaviorById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await behaviorService.findBehavior(10, loggedUser), ok(null));

    assert.strictEqual(behaviorRepository.findBehaviorById.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.findBehaviorById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await behaviorService.findBehavior(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.findBehaviorById.mock.calls.length, 0);
  });
});

describe("Find behaviors by IDs", () => {
  test("should handle a matching behavior", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findBehaviorsById.mockImplementationOnce(() => Promise.resolve(behaviorsData));

    await behaviorService.findBehaviors(["12", "13", "14"], loggedUser);

    assert.strictEqual(behaviorRepository.findBehaviorsById.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.findBehaviorsById.mock.calls[0], [["12", "13", "14"]]);
  });

  test("should handle behavior not found", async () => {
    behaviorRepository.findBehaviorsById.mockImplementationOnce(() => Promise.resolve([]));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await behaviorService.findBehaviors(["10", "11"], loggedUser), ok([]));

    assert.strictEqual(behaviorRepository.findBehaviorsById.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.findBehaviorsById.mock.calls[0], [["10", "11"]]);
  });

  test("should handle no ids provided", async () => {
    const loggedUser = loggedUserFactory.build();

    const findResult = await behaviorService.findBehaviors([], loggedUser);

    assert.ok(findResult.isOk());
    assert.deepStrictEqual(findResult.value, []);
    assert.strictEqual(behaviorRepository.findBehaviorsById.mock.calls.length, 0);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await behaviorService.findBehaviors(["11", "12"], null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.findBehaviorsById.mock.calls.length, 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getEntriesCountByBehavior("12", loggedUser);

    assert.strictEqual(behaviorRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.getEntriesCountById.mock.calls[0], ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await behaviorService.getEntriesCountByBehavior("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

test("Find all behaviors", async () => {
  const behaviorsData = behaviorFactory.buildList(3);

  behaviorRepository.findBehaviors.mockImplementationOnce(() => Promise.resolve(behaviorsData));

  await behaviorService.findAllBehaviors();

  assert.strictEqual(behaviorRepository.findBehaviors.mock.calls.length, 1);
  assert.deepStrictEqual(behaviorRepository.findBehaviors.mock.calls[0], [
    {
      orderBy: "code",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    behaviorRepository.findBehaviors.mockImplementationOnce(() => Promise.resolve(behaviorsData));

    await behaviorService.findPaginatedBehaviors(loggedUser, {});

    assert.strictEqual(behaviorRepository.findBehaviors.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.findBehaviors.mock.calls[0], [
      {
        orderBy: undefined,
        sortOrder: undefined,
        q: undefined,
        offset: undefined,
        limit: undefined,
      },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated behaviors", async () => {
    const behaviorsData = behaviorFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: BehaviorsSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    behaviorRepository.findBehaviors.mockImplementationOnce(() => Promise.resolve([behaviorsData[0]]));

    await behaviorService.findPaginatedBehaviors(loggedUser, searchParams);

    assert.strictEqual(behaviorRepository.findBehaviors.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.findBehaviors.mock.calls[0], [
      {
        orderBy: "libelle",
        sortOrder: "desc",
        q: "Bob",
        offset: 0,
        limit: searchParams.pageSize,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await behaviorService.findPaginatedBehaviors(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getBehaviorsCount(loggedUser);

    assert.strictEqual(behaviorRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.getCount.mock.calls[0], [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await behaviorService.getBehaviorsCount(loggedUser, "test");

    assert.strictEqual(behaviorRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.getCount.mock.calls[0], ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await behaviorService.getBehaviorsCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a behavior", () => {
  test("should be allowed when user has permission", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canEdit: true } } });

    behaviorRepository.updateBehavior.mockImplementationOnce(() => Promise.resolve(ok(behaviorFactory.build())));

    await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    assert.strictEqual(behaviorRepository.updateBehavior.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.updateBehavior.mock.calls[0], [12, behaviorData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = behaviorFactory.build({
      ownerId: "notAdmin",
    });

    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    behaviorRepository.findBehaviorById.mockImplementationOnce(() => Promise.resolve(existingData));
    behaviorRepository.updateBehavior.mockImplementationOnce(() => Promise.resolve(ok(behaviorFactory.build())));

    await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    assert.strictEqual(behaviorRepository.updateBehavior.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.updateBehavior.mock.calls[0], [12, behaviorData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = behaviorFactory.build({
      ownerId: "notAdmin",
    });

    const behaviorData = upsertBehaviorInputFactory.build();

    const user = loggedUserFactory.build();

    behaviorRepository.findBehaviorById.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await behaviorService.updateBehavior(12, behaviorData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.updateBehavior.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to a behavior that exists", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canEdit: true } } });

    behaviorRepository.updateBehavior.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await behaviorService.updateBehavior(12, behaviorData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(behaviorRepository.updateBehavior.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.updateBehavior.mock.calls[0], [12, behaviorData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const updateResult = await behaviorService.updateBehavior(12, behaviorData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.updateBehavior.mock.calls.length, 0);
  });
});

describe("Creation of a behavior", () => {
  test("should create new behavior", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canCreate: true } } });

    behaviorRepository.createBehavior.mockImplementationOnce(() => Promise.resolve(ok(behaviorFactory.build())));

    await behaviorService.createBehavior(behaviorData, loggedUser);

    assert.strictEqual(behaviorRepository.createBehavior.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.createBehavior.mock.calls[0], [
      {
        ...behaviorData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a behavior that already exists", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canCreate: true } } });

    behaviorRepository.createBehavior.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await behaviorService.createBehavior(behaviorData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(behaviorRepository.createBehavior.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.createBehavior.mock.calls[0], [
      {
        ...behaviorData,
        ownerId: loggedUser.id,
      },
    ]);
  });
  test("should not be allowed if user has no permission", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canCreate: false } } });

    const createResult = await behaviorService.createBehavior(behaviorData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.createBehavior.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const behaviorData = upsertBehaviorInputFactory.build();

    const createResult = await behaviorService.createBehavior(behaviorData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.createBehavior.mock.calls.length, 0);
  });
});

describe("Deletion of a behavior", () => {
  test("should handle the deletion of an owned behavior", async () => {
    const loggedUser = loggedUserFactory.build({ id: "12" });

    const behavior = behaviorFactory.build({
      ownerId: loggedUser.id,
    });

    behaviorRepository.findBehaviorById.mockImplementationOnce(() => Promise.resolve(behavior));

    await behaviorService.deleteBehavior(11, loggedUser);

    assert.strictEqual(behaviorRepository.deleteBehaviorById.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.deleteBehaviorById.mock.calls[0], [11]);
  });

  test("should handle the deletion of any behavior if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canDelete: true } } });

    behaviorRepository.findBehaviorById.mockImplementationOnce(() => Promise.resolve(behaviorFactory.build()));

    await behaviorService.deleteBehavior(11, loggedUser);

    assert.strictEqual(behaviorRepository.deleteBehaviorById.mock.calls.length, 1);
    assert.deepStrictEqual(behaviorRepository.deleteBehaviorById.mock.calls[0], [11]);
  });

  test("should not be allowed when deleting a non-owned behavior and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canDelete: false } } });

    behaviorRepository.findBehaviorById.mockImplementationOnce(() => Promise.resolve(behaviorFactory.build()));

    const deleteResult = await behaviorService.deleteBehavior(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.deleteBehaviorById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { behavior: { canDelete: true } } });

    behaviorRepository.getEntriesCountById.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await behaviorService.deleteBehavior(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(behaviorRepository.deleteBehaviorById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await behaviorService.deleteBehavior(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(behaviorRepository.deleteBehaviorById.mock.calls.length, 0);
  });
});

test("Create multiple comportements", async () => {
  const comportementsData = upsertBehaviorInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  behaviorRepository.createBehaviors.mockImplementationOnce(() => Promise.resolve([]));

  await behaviorService.createBehaviors(comportementsData, loggedUser);

  assert.strictEqual(behaviorRepository.createBehaviors.mock.calls.length, 1);
  assert.deepStrictEqual(behaviorRepository.createBehaviors.mock.calls[0], [
    comportementsData.map((comportement) => {
      return {
        ...comportement,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
