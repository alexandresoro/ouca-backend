import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { observerCreateInputFactory, observerFactory } from "@fixtures/domain/observer/observer.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertObserverInputFactory } from "@fixtures/services/observer/observer-service.fixtures.js";
import type { ObserverRepository } from "@interfaces/observer-repository-interface.js";
import type { ObserversSearchParams } from "@ou-ca/common/api/observer.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildObserverService } from "./observer-service.js";

const observerRepository = mock<ObserverRepository>();

const observerService = buildObserverService({
  observerRepository,
});

beforeEach(() => {
  observerRepository.findObserverById.mockReset();
  observerRepository.findObserversById.mockReset();
  observerRepository.findObservers.mockReset();
  observerRepository.createObserver.mockReset();
  observerRepository.createObservers.mockReset();
  observerRepository.updateObserver.mockReset();
  observerRepository.deleteObserverById.mockReset();
  observerRepository.getCount.mockReset();
  observerRepository.getEntriesCountById.mockReset();
});

describe("Find observer", () => {
  test("should handle a matching observer", async () => {
    const observerData = observerFactory.build();
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObserverById.mockImplementationOnce(() => Promise.resolve(observerData));

    await observerService.findObserver(12, loggedUser);

    assert.strictEqual(observerRepository.findObserverById.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.findObserverById.mock.calls[0], [12]);
  });

  test("should handle observer not found", async () => {
    observerRepository.findObserverById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await observerService.findObserver(10, loggedUser), ok(null));

    assert.strictEqual(observerRepository.findObserverById.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.findObserverById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await observerService.findObserver(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(observerRepository.findObserverById.mock.calls.length, 0);
  });
});

describe("Find observers by IDs", () => {
  test("should handle observers found", async () => {
    const observersData = observerFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObserversById.mockImplementationOnce(() => Promise.resolve(observersData));

    await observerService.findObservers(["12", "13", "14"], loggedUser);

    assert.strictEqual(observerRepository.findObserversById.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.findObserversById.mock.calls[0], [["12", "13", "14"]]);
  });

  test("should handle no observers found", async () => {
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObserversById.mockImplementationOnce(() => Promise.resolve([]));

    await observerService.findObservers(["12", "13", "14"], loggedUser);

    assert.strictEqual(observerRepository.findObserversById.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.findObserversById.mock.calls[0], [["12", "13", "14"]]);
  });

  test("should handle no ids provided", async () => {
    const loggedUser = loggedUserFactory.build();

    const findResult = await observerService.findObservers([], loggedUser);

    assert.ok(findResult.isOk());
    assert.deepStrictEqual(findResult.value, []);
    assert.strictEqual(observerRepository.findObserversById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await observerService.findObservers(["12", "13", "14"], null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(observerRepository.findObserversById.mock.calls.length, 0);
  });
});

test("Find all observers", async () => {
  const observersData = observerFactory.buildList(3);

  observerRepository.findObservers.mockImplementationOnce(() => Promise.resolve(observersData));

  await observerService.findAllObservers();

  assert.strictEqual(observerRepository.findObservers.mock.calls.length, 1);
  assert.deepStrictEqual(observerRepository.findObservers.mock.calls[0], [
    {
      orderBy: "libelle",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const observersData = observerFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    observerRepository.findObservers.mockImplementationOnce(() => Promise.resolve(observersData));

    await observerService.findPaginatedObservers(loggedUser, {});

    assert.strictEqual(observerRepository.findObservers.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.findObservers.mock.calls[0], [
      { limit: undefined, offset: undefined, orderBy: undefined, q: undefined, sortOrder: undefined },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated observers", async () => {
    const observersData = observerFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: ObserversSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    observerRepository.findObservers.mockImplementationOnce(() => Promise.resolve([observersData[0]]));

    await observerService.findPaginatedObservers(loggedUser, searchParams);

    assert.strictEqual(observerRepository.findObservers.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.findObservers.mock.calls[0], [
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
    const entitiesPaginatedResult = await observerService.findPaginatedObservers(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await observerService.getObserversCount(loggedUser);

    assert.strictEqual(observerRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.getCount.mock.calls[0], [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await observerService.getObserversCount(loggedUser, "test");

    assert.strictEqual(observerRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.getCount.mock.calls[0], ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await observerService.getObserversCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of an observer", () => {
  test("should be allowed when user has permission", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { observer: { canEdit: true } } });

    observerRepository.updateObserver.mockImplementationOnce(() => Promise.resolve(ok(observerFactory.build())));

    await observerService.updateObserver(12, observerData, loggedUser);

    assert.strictEqual(observerRepository.updateObserver.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.updateObserver.mock.calls[0], [12, observerData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = observerFactory.build({
      ownerId: "notAdmin",
    });

    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    observerRepository.findObserverById.mockImplementationOnce(() => Promise.resolve(existingData));
    observerRepository.updateObserver.mockImplementationOnce(() => Promise.resolve(ok(observerFactory.build())));

    await observerService.updateObserver(12, observerData, loggedUser);

    assert.strictEqual(observerRepository.updateObserver.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.updateObserver.mock.calls[0], [12, observerData]);
  });

  test("should not be allowed when requested by an use that is nor owner nor has permission", async () => {
    const existingData = observerFactory.build({
      ownerId: "notAdmin",
    });

    const observerData = upsertObserverInputFactory.build();

    const user = loggedUserFactory.build();

    observerRepository.findObserverById.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await observerService.updateObserver(12, observerData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(observerRepository.updateObserver.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to an observer that exists", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { observer: { canEdit: true } } });

    observerRepository.updateObserver.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await observerService.updateObserver(12, observerData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(observerRepository.updateObserver.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.updateObserver.mock.calls[0], [12, observerData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const observerData = upsertObserverInputFactory.build();

    const updateResult = await observerService.updateObserver(12, observerData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(observerRepository.updateObserver.mock.calls.length, 0);
  });
});

describe("Creation of an observer", () => {
  test("should create new observer if has permission", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { observer: { canCreate: true } } });

    observerRepository.createObserver.mockImplementationOnce(() => Promise.resolve(ok(observerFactory.build())));

    await observerService.createObserver(observerData, loggedUser);

    assert.strictEqual(observerRepository.createObserver.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.createObserver.mock.calls[0], [
      {
        ...observerData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { observer: { canCreate: false } } });

    const createResult = await observerService.createObserver(observerData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(observerRepository.createObserver.mock.calls.length, 0);
  });

  test("should not be allowed when trying to create an observer that already exists", async () => {
    const observerData = upsertObserverInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { observer: { canCreate: true } } });

    observerRepository.createObserver.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await observerService.createObserver(observerData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(observerRepository.createObserver.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.createObserver.mock.calls[0], [
      {
        ...observerData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const observerData = upsertObserverInputFactory.build();

    const createResult = await observerService.createObserver(observerData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(observerRepository.createObserver.mock.calls.length, 0);
  });
});

describe("Deletion of an observer", () => {
  test("should handle the deletion of an owned observer", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const observer = observerFactory.build({ ownerId: loggedUser.id });

    observerRepository.findObserverById.mockImplementationOnce(() => Promise.resolve(observer));

    await observerService.deleteObserver(11, loggedUser);

    assert.strictEqual(observerRepository.deleteObserverById.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.deleteObserverById.mock.calls[0], [11]);
  });

  test("should handle the deletion of any observer if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { observer: { canDelete: true } } });

    await observerService.deleteObserver(11, loggedUser);

    assert.strictEqual(observerRepository.deleteObserverById.mock.calls.length, 1);
    assert.deepStrictEqual(observerRepository.deleteObserverById.mock.calls[0], [11]);
  });

  test("should not be allowed when trying to delete a non-owned observer and no permission", async () => {
    const loggedUser = loggedUserFactory.build();

    const deleteResult = await observerService.deleteObserver(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(observerRepository.deleteObserverById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await observerService.deleteObserver(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(observerRepository.deleteObserverById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { observer: { canDelete: true } } });

    observerRepository.getEntriesCountById.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await observerService.deleteObserver(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(observerRepository.deleteObserverById.mock.calls.length, 0);
  });
});

test("Create multiple observers", async () => {
  const observersData = observerCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  observerRepository.createObservers.mockImplementationOnce(() => Promise.resolve([]));

  await observerService.createObservers(observersData, loggedUser);

  assert.strictEqual(observerRepository.createObservers.mock.calls.length, 1);
  assert.deepStrictEqual(observerRepository.createObservers.mock.calls[0], [
    observersData.map((observer) => {
      return {
        ...observer,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
