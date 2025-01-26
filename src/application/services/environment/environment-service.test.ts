import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { environmentFactory } from "@fixtures/domain/environment/environment.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertEnvironmentInputFactory } from "@fixtures/services/environment/environment-service.fixtures.js";
import type { EnvironmentRepository } from "@interfaces/environment-repository-interface.js";
import type { EnvironmentsSearchParams } from "@ou-ca/common/api/environment.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildEnvironmentService } from "./environment-service.js";

const environmentRepository = mock<EnvironmentRepository>();

const environmentService = buildEnvironmentService({
  environmentRepository,
});

beforeEach(() => {
  environmentRepository.findEnvironmentById.mockReset();
  environmentRepository.findEnvironmentsById.mockReset();
  environmentRepository.findEnvironments.mockReset();
  environmentRepository.createEnvironment.mockReset();
  environmentRepository.createEnvironments.mockReset();
  environmentRepository.updateEnvironment.mockReset();
  environmentRepository.deleteEnvironmentById.mockReset();
  environmentRepository.getCount.mockReset();
  environmentRepository.getEntriesCountById.mockReset();
});

describe("Find environment", () => {
  test("should handle a matching environment", async () => {
    const environmentData = environmentFactory.build();
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findEnvironmentById.mockImplementationOnce(() => Promise.resolve(environmentData));

    await environmentService.findEnvironment(12, loggedUser);

    assert.strictEqual(environmentRepository.findEnvironmentById.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.findEnvironmentById.mock.calls[0], [12]);
  });

  test("should handle environment not found", async () => {
    environmentRepository.findEnvironmentById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await environmentService.findEnvironment(10, loggedUser), ok(null));

    assert.strictEqual(environmentRepository.findEnvironmentById.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.findEnvironmentById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await environmentService.findEnvironment(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.findEnvironmentById.mock.calls.length, 0);
  });
});

describe("Find environments by IDs", () => {
  test("should handle a matching environment", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findEnvironmentsById.mockImplementationOnce(() => Promise.resolve(environmentsData));

    await environmentService.findEnvironments(["12", "13", "14"], loggedUser);

    assert.strictEqual(environmentRepository.findEnvironmentsById.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.findEnvironmentsById.mock.calls[0], [["12", "13", "14"]]);
  });

  test("should handle environment not found", async () => {
    environmentRepository.findEnvironmentsById.mockImplementationOnce(() => Promise.resolve([]));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await environmentService.findEnvironments(["10", "11"], loggedUser), ok([]));

    assert.strictEqual(environmentRepository.findEnvironmentsById.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.findEnvironmentsById.mock.calls[0], [["10", "11"]]);
  });

  test("should handle no ids provided", async () => {
    const loggedUser = loggedUserFactory.build();

    const findResult = await environmentService.findEnvironments([], loggedUser);

    assert.ok(findResult.isOk());
    assert.deepStrictEqual(findResult.value, []);
    assert.strictEqual(environmentRepository.findEnvironmentsById.mock.calls.length, 0);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await environmentService.findEnvironments(["11", "12"], null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.findEnvironmentsById.mock.calls.length, 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEntriesCountByEnvironment("12", loggedUser);

    assert.strictEqual(environmentRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.getEntriesCountById.mock.calls[0], ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await environmentService.getEntriesCountByEnvironment("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

test("Find all environments", async () => {
  const environmentsData = environmentFactory.buildList(3);

  environmentRepository.findEnvironments.mockImplementationOnce(() => Promise.resolve(environmentsData));

  await environmentService.findAllEnvironments();

  assert.strictEqual(environmentRepository.findEnvironments.mock.calls.length, 1);
  assert.deepStrictEqual(environmentRepository.findEnvironments.mock.calls[0], [{ orderBy: "libelle" }]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    environmentRepository.findEnvironments.mockImplementationOnce(() => Promise.resolve(environmentsData));

    await environmentService.findPaginatedEnvironments(loggedUser, {});

    assert.strictEqual(environmentRepository.findEnvironments.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.findEnvironments.mock.calls[0], [
      {
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
      },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated environments", async () => {
    const environmentsData = environmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: EnvironmentsSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    environmentRepository.findEnvironments.mockImplementationOnce(() => Promise.resolve([environmentsData[0]]));

    await environmentService.findPaginatedEnvironments(loggedUser, searchParams);

    assert.strictEqual(environmentRepository.findEnvironments.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.findEnvironments.mock.calls[0], [
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
    const entitiesPaginatedResult = await environmentService.findPaginatedEnvironments(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEnvironmentsCount(loggedUser);

    assert.strictEqual(environmentRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.getCount.mock.calls[0], [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await environmentService.getEnvironmentsCount(loggedUser, "test");

    assert.strictEqual(environmentRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.getCount.mock.calls[0], ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await environmentService.getEnvironmentsCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of an environment", () => {
  test("should be allowed when user has permission", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canEdit: true } } });

    environmentRepository.updateEnvironment.mockImplementationOnce(() =>
      Promise.resolve(ok(environmentFactory.build())),
    );

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.strictEqual(environmentRepository.updateEnvironment.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.updateEnvironment.mock.calls[0], [12, environmentData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = environmentFactory.build({
      ownerId: "notAdmin",
    });

    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    environmentRepository.findEnvironmentById.mockImplementationOnce(() => Promise.resolve(existingData));
    environmentRepository.updateEnvironment.mockImplementationOnce(() =>
      Promise.resolve(ok(environmentFactory.build())),
    );

    await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.strictEqual(environmentRepository.updateEnvironment.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.updateEnvironment.mock.calls[0], [12, environmentData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = environmentFactory.build({
      ownerId: "notAdmin",
    });

    const environmentData = upsertEnvironmentInputFactory.build();

    const user = loggedUserFactory.build();

    environmentRepository.findEnvironmentById.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await environmentService.updateEnvironment(12, environmentData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.updateEnvironment.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to an environment that exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canEdit: true } } });

    environmentRepository.updateEnvironment.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await environmentService.updateEnvironment(12, environmentData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(environmentRepository.updateEnvironment.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.updateEnvironment.mock.calls[0], [12, environmentData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const updateResult = await environmentService.updateEnvironment(12, environmentData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.updateEnvironment.mock.calls.length, 0);
  });
});

describe("Creation of an environment", () => {
  test("should create new environment", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canCreate: true } } });

    environmentRepository.createEnvironment.mockImplementationOnce(() =>
      Promise.resolve(ok(environmentFactory.build())),
    );

    await environmentService.createEnvironment(environmentData, loggedUser);

    assert.strictEqual(environmentRepository.createEnvironment.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.createEnvironment.mock.calls[0], [
      {
        ...environmentData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create an environment that already exists", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canCreate: true } } });

    environmentRepository.createEnvironment.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await environmentService.createEnvironment(environmentData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(environmentRepository.createEnvironment.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.createEnvironment.mock.calls[0], [
      {
        ...environmentData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canCreate: false } } });

    const createResult = await environmentService.createEnvironment(environmentData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.createEnvironment.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const environmentData = upsertEnvironmentInputFactory.build();

    const createResult = await environmentService.createEnvironment(environmentData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.createEnvironment.mock.calls.length, 0);
  });
});

describe("Deletion of an environment", () => {
  test("should handle the deletion of an owned environment", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const environment = environmentFactory.build({
      ownerId: loggedUser.id,
    });

    environmentRepository.findEnvironmentById.mockImplementationOnce(() => Promise.resolve(environment));

    await environmentService.deleteEnvironment(11, loggedUser);

    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.deleteEnvironmentById.mock.calls[0], [11]);
  });

  test("hould handle the deletion of any environment if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canDelete: true } } });

    environmentRepository.findEnvironmentById.mockImplementationOnce(() => Promise.resolve(environmentFactory.build()));

    await environmentService.deleteEnvironment(11, loggedUser);

    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.calls.length, 1);
    assert.deepStrictEqual(environmentRepository.deleteEnvironmentById.mock.calls[0], [11]);
  });

  test("should not be allowed when deleting a non-owned environment and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canDelete: false } } });

    environmentRepository.findEnvironmentById.mockImplementationOnce(() => Promise.resolve(environmentFactory.build()));

    const deleteResult = await environmentService.deleteEnvironment(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { environment: { canDelete: true } } });

    environmentRepository.getEntriesCountById.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await environmentService.deleteEnvironment(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await environmentService.deleteEnvironment(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(environmentRepository.deleteEnvironmentById.mock.calls.length, 0);
  });
});

test("Create multiple environments", async () => {
  const environmentsData = upsertEnvironmentInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  environmentRepository.createEnvironments.mockImplementationOnce(() => Promise.resolve([]));

  await environmentService.createEnvironments(environmentsData, loggedUser);

  assert.strictEqual(environmentRepository.createEnvironments.mock.calls.length, 1);
  assert.deepStrictEqual(environmentRepository.createEnvironments.mock.calls[0], [
    environmentsData.map((environment) => {
      return {
        ...environment,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
