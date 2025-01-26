import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { distanceEstimateFactory } from "@fixtures/domain/distance-estimate/distance-estimate.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertDistanceEstimateInputFactory } from "@fixtures/services/distance-estimate/distance-estimate-service.fixtures.js";
import type { DistanceEstimateRepository } from "@interfaces/distance-estimate-repository-interface.js";
import type { DistanceEstimatesSearchParams } from "@ou-ca/common/api/distance-estimate.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildDistanceEstimateService } from "./distance-estimate-service.js";

const distanceEstimateRepository = mock<DistanceEstimateRepository>();

const distanceEstimateService = buildDistanceEstimateService({
  distanceEstimateRepository,
});

beforeEach(() => {
  distanceEstimateRepository.findDistanceEstimateById.mockReset();
  distanceEstimateRepository.findDistanceEstimates.mockReset();
  distanceEstimateRepository.createDistanceEstimate.mockReset();
  distanceEstimateRepository.createDistanceEstimates.mockReset();
  distanceEstimateRepository.updateDistanceEstimate.mockReset();
  distanceEstimateRepository.deleteDistanceEstimateById.mockReset();
  distanceEstimateRepository.getCount.mockReset();
  distanceEstimateRepository.getEntriesCountById.mockReset();
});

describe("Find distance estimate", () => {
  test("should handle a matching distance estimate", async () => {
    const distanceEstimateData = distanceEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    distanceEstimateRepository.findDistanceEstimateById.mockImplementationOnce(() =>
      Promise.resolve(distanceEstimateData),
    );

    await distanceEstimateService.findDistanceEstimate(12, loggedUser);

    assert.strictEqual(distanceEstimateRepository.findDistanceEstimateById.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.findDistanceEstimateById.mock.calls[0], [12]);
  });

  test("should handle distance estimate not found", async () => {
    distanceEstimateRepository.findDistanceEstimateById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await distanceEstimateService.findDistanceEstimate(10, loggedUser), ok(null));

    assert.strictEqual(distanceEstimateRepository.findDistanceEstimateById.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.findDistanceEstimateById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await distanceEstimateService.findDistanceEstimate(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(distanceEstimateRepository.findDistanceEstimateById.mock.calls.length, 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await distanceEstimateService.getEntriesCountByDistanceEstimate("12", loggedUser);

    assert.strictEqual(distanceEstimateRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.getEntriesCountById.mock.calls[0], ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await distanceEstimateService.getEntriesCountByDistanceEstimate("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

test("Find all distance estimates", async () => {
  const distanceEstimatesData = distanceEstimateFactory.buildList(3);

  distanceEstimateRepository.findDistanceEstimates.mockImplementationOnce(() => Promise.resolve(distanceEstimatesData));

  await distanceEstimateService.findAllDistanceEstimates();

  assert.strictEqual(distanceEstimateRepository.findDistanceEstimates.mock.calls.length, 1);
  assert.deepStrictEqual(distanceEstimateRepository.findDistanceEstimates.mock.calls[0], [
    {
      orderBy: "libelle",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const distanceEstimatesData = distanceEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    distanceEstimateRepository.findDistanceEstimates.mockImplementationOnce(() =>
      Promise.resolve(distanceEstimatesData),
    );

    await distanceEstimateService.findPaginatedDistanceEstimates(loggedUser, {});

    assert.strictEqual(distanceEstimateRepository.findDistanceEstimates.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.findDistanceEstimates.mock.calls[0], [
      { limit: undefined, offset: undefined, orderBy: undefined, q: undefined, sortOrder: undefined },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated distance estimates", async () => {
    const distanceEstimatesData = distanceEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: DistanceEstimatesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    distanceEstimateRepository.findDistanceEstimates.mockImplementationOnce(() =>
      Promise.resolve([distanceEstimatesData[0]]),
    );

    await distanceEstimateService.findPaginatedDistanceEstimates(loggedUser, searchParams);

    assert.strictEqual(distanceEstimateRepository.findDistanceEstimates.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.findDistanceEstimates.mock.calls[0], [
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
    const entitiesPaginatedResult = await distanceEstimateService.findPaginatedDistanceEstimates(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await distanceEstimateService.getDistanceEstimatesCount(loggedUser);

    assert.strictEqual(distanceEstimateRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.getCount.mock.calls[0], [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await distanceEstimateService.getDistanceEstimatesCount(loggedUser, "test");

    assert.strictEqual(distanceEstimateRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.getCount.mock.calls[0], ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await distanceEstimateService.getDistanceEstimatesCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a distance estimate", () => {
  test("should be allowed when user has permission", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canEdit: true } } });

    distanceEstimateRepository.updateDistanceEstimate.mockImplementationOnce(() =>
      Promise.resolve(ok(distanceEstimateFactory.build())),
    );

    await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    assert.strictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls[0], [12, distanceEstimateData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = distanceEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    distanceEstimateRepository.findDistanceEstimateById.mockImplementationOnce(() => Promise.resolve(existingData));
    distanceEstimateRepository.updateDistanceEstimate.mockImplementationOnce(() =>
      Promise.resolve(ok(distanceEstimateFactory.build())),
    );

    await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    assert.strictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls[0], [12, distanceEstimateData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = distanceEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const user = loggedUserFactory.build();

    distanceEstimateRepository.findDistanceEstimateById.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to a distance estimate that exists", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canEdit: true } } });

    distanceEstimateRepository.updateDistanceEstimate.mockImplementationOnce(() =>
      Promise.resolve(err("alreadyExists")),
    );

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls[0], [12, distanceEstimateData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const updateResult = await distanceEstimateService.updateDistanceEstimate(12, distanceEstimateData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(distanceEstimateRepository.updateDistanceEstimate.mock.calls.length, 0);
  });
});

describe("Creation of a distance estimate", () => {
  test("should create new distance estimate", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canCreate: true } } });

    distanceEstimateRepository.createDistanceEstimate.mockImplementationOnce(() =>
      Promise.resolve(ok(distanceEstimateFactory.build())),
    );

    await distanceEstimateService.createDistanceEstimate(distanceEstimateData, loggedUser);

    assert.strictEqual(distanceEstimateRepository.createDistanceEstimate.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.createDistanceEstimate.mock.calls[0], [
      {
        ...distanceEstimateData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a distance estimate that already exists", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canCreate: true } } });

    distanceEstimateRepository.createDistanceEstimate.mockImplementationOnce(() =>
      Promise.resolve(err("alreadyExists")),
    );

    const createResult = await distanceEstimateService.createDistanceEstimate(distanceEstimateData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(distanceEstimateRepository.createDistanceEstimate.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.createDistanceEstimate.mock.calls[0], [
      {
        ...distanceEstimateData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canCreate: false } } });

    const createResult = await distanceEstimateService.createDistanceEstimate(distanceEstimateData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(distanceEstimateRepository.createDistanceEstimate.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const distanceEstimateData = upsertDistanceEstimateInputFactory.build();

    const createResult = await distanceEstimateService.createDistanceEstimate(distanceEstimateData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(distanceEstimateRepository.createDistanceEstimate.mock.calls.length, 0);
  });
});

describe("Deletion of a distance estimate", () => {
  test("should handle the deletion of an owned distance estimate", async () => {
    const loggedUser = loggedUserFactory.build({ id: "12" });

    const distanceEstimate = distanceEstimateFactory.build({
      ownerId: loggedUser.id,
    });

    distanceEstimateRepository.findDistanceEstimateById.mockImplementationOnce(() => Promise.resolve(distanceEstimate));

    await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    assert.strictEqual(distanceEstimateRepository.deleteDistanceEstimateById.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.deleteDistanceEstimateById.mock.calls[0], [11]);
  });

  test("should handle the deletion of any distance estimate if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canDelete: true } } });

    distanceEstimateRepository.findDistanceEstimateById.mockImplementationOnce(() =>
      Promise.resolve(distanceEstimateFactory.build()),
    );

    await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    assert.strictEqual(distanceEstimateRepository.deleteDistanceEstimateById.mock.calls.length, 1);
    assert.deepStrictEqual(distanceEstimateRepository.deleteDistanceEstimateById.mock.calls[0], [11]);
  });

  test("should not be allowed when deleting a non-owned distance estimate and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canDelete: false } } });

    distanceEstimateRepository.findDistanceEstimateById.mockImplementationOnce(() =>
      Promise.resolve(distanceEstimateFactory.build()),
    );

    const deleteResult = await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(distanceEstimateRepository.deleteDistanceEstimateById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { distanceEstimate: { canDelete: true } } });

    distanceEstimateRepository.getEntriesCountById.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await distanceEstimateService.deleteDistanceEstimate(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(distanceEstimateRepository.deleteDistanceEstimateById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await distanceEstimateService.deleteDistanceEstimate(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(distanceEstimateRepository.deleteDistanceEstimateById.mock.calls.length, 0);
  });
});

test("Create multiple distance estimates", async () => {
  const distanceEstimatesData = upsertDistanceEstimateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  distanceEstimateRepository.createDistanceEstimates.mockImplementationOnce(() => Promise.resolve([]));

  await distanceEstimateService.createDistanceEstimates(distanceEstimatesData, loggedUser);

  assert.strictEqual(distanceEstimateRepository.createDistanceEstimates.mock.calls.length, 1);
  assert.deepStrictEqual(distanceEstimateRepository.createDistanceEstimates.mock.calls[0], [
    distanceEstimatesData.map((distanceEstimate) => {
      return {
        ...distanceEstimate,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
