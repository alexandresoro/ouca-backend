import assert from "node:assert/strict";
import test, { describe, beforeEach } from "node:test";
import {
  numberEstimateCreateInputFactory,
  numberEstimateFactory,
} from "@fixtures/domain/number-estimate/number-estimate.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertNumberEstimateInputFactory } from "@fixtures/services/number-estimate/number-estimate-service.fixtures.js";
import type { NumberEstimateRepository } from "@interfaces/number-estimate-repository-interface.js";
import type { NumberEstimatesSearchParams } from "@ou-ca/common/api/number-estimate.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildNumberEstimateService } from "./number-estimate-service.js";

const numberEstimateRepository = mock<NumberEstimateRepository>();

const numberEstimateService = buildNumberEstimateService({
  numberEstimateRepository,
});

beforeEach(() => {
  numberEstimateRepository.findNumberEstimateById.mock.resetCalls();
  numberEstimateRepository.findNumberEstimates.mock.resetCalls();
  numberEstimateRepository.createNumberEstimate.mock.resetCalls();
  numberEstimateRepository.createNumberEstimates.mock.resetCalls();
  numberEstimateRepository.updateNumberEstimate.mock.resetCalls();
  numberEstimateRepository.deleteNumberEstimateById.mock.resetCalls();
  numberEstimateRepository.getCount.mock.resetCalls();
  numberEstimateRepository.getEntriesCountById.mock.resetCalls();
});

describe("Find number estimate", () => {
  test("should handle a matching number estimate", async () => {
    const numberEstimateData = numberEstimateFactory.build();
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findNumberEstimateById.mock.mockImplementationOnce(() =>
      Promise.resolve(numberEstimateData),
    );

    await numberEstimateService.findNumberEstimate(12, loggedUser);

    assert.strictEqual(numberEstimateRepository.findNumberEstimateById.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.findNumberEstimateById.mock.calls[0].arguments, [12]);
  });

  test("should handle number estimate not found", async () => {
    numberEstimateRepository.findNumberEstimateById.mock.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await numberEstimateService.findNumberEstimate(10, loggedUser), ok(null));

    assert.strictEqual(numberEstimateRepository.findNumberEstimateById.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.findNumberEstimateById.mock.calls[0].arguments, [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await numberEstimateService.findNumberEstimate(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(numberEstimateRepository.findNumberEstimateById.mock.callCount(), 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getEntriesCountByNumberEstimate("12", loggedUser);

    assert.strictEqual(numberEstimateRepository.getEntriesCountById.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.getEntriesCountById.mock.calls[0].arguments, ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await numberEstimateService.getEntriesCountByNumberEstimate("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

test("Find all number estimates", async () => {
  const numberEstimatesData = numberEstimateFactory.buildList(3);

  numberEstimateRepository.findNumberEstimates.mock.mockImplementationOnce(() => Promise.resolve(numberEstimatesData));

  await numberEstimateService.findAllNumberEstimates();

  assert.strictEqual(numberEstimateRepository.findNumberEstimates.mock.callCount(), 1);
  assert.deepStrictEqual(numberEstimateRepository.findNumberEstimates.mock.calls[0].arguments, [
    {
      orderBy: "libelle",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const numberEstimatesData = numberEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    numberEstimateRepository.findNumberEstimates.mock.mockImplementationOnce(() =>
      Promise.resolve(numberEstimatesData),
    );

    await numberEstimateService.findPaginatesNumberEstimates(loggedUser, {});

    assert.strictEqual(numberEstimateRepository.findNumberEstimates.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.findNumberEstimates.mock.calls[0].arguments, [
      { limit: undefined, offset: undefined, orderBy: undefined, q: undefined, sortOrder: undefined },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated number estimates", async () => {
    const numberEstimatesData = numberEstimateFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: NumberEstimatesSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    numberEstimateRepository.findNumberEstimates.mock.mockImplementationOnce(() =>
      Promise.resolve([numberEstimatesData[0]]),
    );

    await numberEstimateService.findPaginatesNumberEstimates(loggedUser, searchParams);

    assert.strictEqual(numberEstimateRepository.findNumberEstimates.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.findNumberEstimates.mock.calls[0].arguments, [
      {
        q: "Bob",
        orderBy: "libelle",
        sortOrder: "desc",
        offset: 0,
        limit: 10,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await numberEstimateService.findPaginatesNumberEstimates(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getNumberEstimatesCount(loggedUser);

    assert.strictEqual(numberEstimateRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.getCount.mock.calls[0].arguments, [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await numberEstimateService.getNumberEstimatesCount(loggedUser, "test");

    assert.strictEqual(numberEstimateRepository.getCount.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.getCount.mock.calls[0].arguments, ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await numberEstimateService.getNumberEstimatesCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a number estimate", () => {
  test("should be allowed when user has permission", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canEdit: true } } });

    numberEstimateRepository.updateNumberEstimate.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(numberEstimateFactory.build())),
    );

    await numberEstimateService.updateNumberEstimate(12, numberEstimateData, loggedUser);

    assert.strictEqual(numberEstimateRepository.updateNumberEstimate.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.updateNumberEstimate.mock.calls[0].arguments, [
      12,
      numberEstimateData,
    ]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = numberEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    numberEstimateRepository.findNumberEstimateById.mock.mockImplementationOnce(() => Promise.resolve(existingData));
    numberEstimateRepository.updateNumberEstimate.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(numberEstimateFactory.build())),
    );

    await numberEstimateService.updateNumberEstimate(12, numberEstimateData, loggedUser);

    assert.strictEqual(numberEstimateRepository.updateNumberEstimate.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.updateNumberEstimate.mock.calls[0].arguments, [
      12,
      numberEstimateData,
    ]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = numberEstimateFactory.build({
      ownerId: "notAdmin",
    });

    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const user = loggedUserFactory.build();

    numberEstimateRepository.findNumberEstimateById.mock.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await numberEstimateService.updateNumberEstimate(12, numberEstimateData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(numberEstimateRepository.updateNumberEstimate.mock.callCount(), 0);
  });

  test("should not be allowed when trying to update to a number estimate that exists", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canEdit: true } } });

    numberEstimateRepository.updateNumberEstimate.mock.mockImplementationOnce(() =>
      Promise.resolve(err("alreadyExists")),
    );

    const updateResult = await numberEstimateService.updateNumberEstimate(12, numberEstimateData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(numberEstimateRepository.updateNumberEstimate.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.updateNumberEstimate.mock.calls[0].arguments, [
      12,
      numberEstimateData,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const updateResult = await numberEstimateService.updateNumberEstimate(12, numberEstimateData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(numberEstimateRepository.updateNumberEstimate.mock.callCount(), 0);
  });
});

describe("Creation of a number estimate", () => {
  test("should create new number estimate", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canCreate: true } } });

    numberEstimateRepository.createNumberEstimate.mock.mockImplementationOnce(() =>
      Promise.resolve(ok(numberEstimateFactory.build())),
    );

    await numberEstimateService.createNumberEstimate(numberEstimateData, loggedUser);

    assert.strictEqual(numberEstimateRepository.createNumberEstimate.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.createNumberEstimate.mock.calls[0].arguments, [
      {
        ...numberEstimateData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a number estimate that already exists", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canCreate: true } } });

    numberEstimateRepository.createNumberEstimate.mock.mockImplementationOnce(() =>
      Promise.resolve(err("alreadyExists")),
    );

    const createResult = await numberEstimateService.createNumberEstimate(numberEstimateData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(numberEstimateRepository.createNumberEstimate.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.createNumberEstimate.mock.calls[0].arguments, [
      {
        ...numberEstimateData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canCreate: false } } });

    const createResult = await numberEstimateService.createNumberEstimate(numberEstimateData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(numberEstimateRepository.createNumberEstimate.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const numberEstimateData = upsertNumberEstimateInputFactory.build();

    const createResult = await numberEstimateService.createNumberEstimate(numberEstimateData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(numberEstimateRepository.createNumberEstimate.mock.callCount(), 0);
  });
});

describe("Deletion of a number estimate", () => {
  test("should handle the deletion of an owned number estimate", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const numberEstimate = numberEstimateFactory.build({
      ownerId: loggedUser.id,
    });

    numberEstimateRepository.findNumberEstimateById.mock.mockImplementationOnce(() => Promise.resolve(numberEstimate));

    await numberEstimateService.deleteNumberEstimate(11, loggedUser);

    assert.strictEqual(numberEstimateRepository.deleteNumberEstimateById.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.deleteNumberEstimateById.mock.calls[0].arguments, [11]);
  });

  test("should handle the deletion of any number estimate if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canDelete: true } } });

    numberEstimateRepository.findNumberEstimateById.mock.mockImplementationOnce(() =>
      Promise.resolve(numberEstimateFactory.build()),
    );

    await numberEstimateService.deleteNumberEstimate(11, loggedUser);

    assert.strictEqual(numberEstimateRepository.deleteNumberEstimateById.mock.callCount(), 1);
    assert.deepStrictEqual(numberEstimateRepository.deleteNumberEstimateById.mock.calls[0].arguments, [11]);
  });

  test("should not be allowed when deleting a non-owned number estimate and no permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canDelete: false } } });

    numberEstimateRepository.findNumberEstimateById.mock.mockImplementationOnce(() =>
      Promise.resolve(numberEstimateFactory.build()),
    );

    const deleteResult = await numberEstimateService.deleteNumberEstimate(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(numberEstimateRepository.deleteNumberEstimateById.mock.callCount(), 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { numberEstimate: { canDelete: true } } });

    numberEstimateRepository.getEntriesCountById.mock.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await numberEstimateService.deleteNumberEstimate(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(numberEstimateRepository.deleteNumberEstimateById.mock.callCount(), 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await numberEstimateService.deleteNumberEstimate(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(numberEstimateRepository.deleteNumberEstimateById.mock.callCount(), 0);
  });
});

test("Create multiple number estimates", async () => {
  const numberEstimatesData = numberEstimateCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  numberEstimateRepository.createNumberEstimates.mock.mockImplementationOnce(() => Promise.resolve([]));

  await numberEstimateService.createNumberEstimates(numberEstimatesData, loggedUser);

  assert.strictEqual(numberEstimateRepository.createNumberEstimates.mock.callCount(), 1);
  assert.deepStrictEqual(numberEstimateRepository.createNumberEstimates.mock.calls[0].arguments, [
    numberEstimatesData.map((numberEstimate) => {
      return {
        ...numberEstimate,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
