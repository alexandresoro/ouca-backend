import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { departmentFactory } from "@fixtures/domain/department/department.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { upsertDepartmentInputFactory } from "@fixtures/services/department/department-service.fixtures.js";
import type { DepartmentRepository } from "@interfaces/department-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { TownRepository } from "@interfaces/town-repository-interface.js";
import type { DepartmentsSearchParams } from "@ou-ca/common/api/department.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildDepartmentService } from "./department-service.js";

const departmentRepository = mock<DepartmentRepository>();
const townRepository = mock<TownRepository>();
const localityRepository = mock<LocalityRepository>();

const departmentService = buildDepartmentService({
  departmentRepository,
  townRepository,
  localityRepository,
});

beforeEach(() => {
  departmentRepository.findDepartmentById.mockReset();
  departmentRepository.findDepartments.mockReset();
  departmentRepository.createDepartment.mockReset();
  departmentRepository.createDepartments.mockReset();
  departmentRepository.updateDepartment.mockReset();
  departmentRepository.deleteDepartmentById.mockReset();
  departmentRepository.getCount.mockReset();
  departmentRepository.getEntriesCountById.mockReset();
  departmentRepository.findDepartmentByTownId.mockReset();
  townRepository.getCount.mockReset();
  localityRepository.getCount.mockReset();
});

describe("Find department", () => {
  test("should handle a matching department", async () => {
    const departmentData = departmentFactory.build();
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartmentById.mockImplementationOnce(() => Promise.resolve(departmentData));

    await departmentService.findDepartment(12, loggedUser);

    assert.strictEqual(departmentRepository.findDepartmentById.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.findDepartmentById.mock.calls[0], [12]);
  });

  test("should handle department not found", async () => {
    departmentRepository.findDepartmentById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await departmentService.findDepartment(10, loggedUser), ok(null));

    assert.strictEqual(departmentRepository.findDepartmentById.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.findDepartmentById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await departmentService.findDepartment(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(departmentRepository.findDepartmentById.mock.calls.length, 0);
  });
});

describe("Cities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getTownsCountByDepartment("12", loggedUser);

    assert.strictEqual(townRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(townRepository.getCount.mock.calls[0], [undefined, "12"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const townsCountResult = await departmentService.getTownsCountByDepartment("12", null);

    assert.deepStrictEqual(townsCountResult, err("notAllowed"));
  });
});

describe("Localities count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getLocalitiesCountByDepartment("12", loggedUser);

    assert.strictEqual(localityRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(localityRepository.getCount.mock.calls[0], [undefined, undefined, "12"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const localitiesCountResult = await departmentService.getLocalitiesCountByDepartment("12", null);

    assert.deepStrictEqual(localitiesCountResult, err("notAllowed"));
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getEntriesCountByDepartment("12", loggedUser);

    assert.strictEqual(departmentRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.getEntriesCountById.mock.calls[0], ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entriesCountResult = await departmentService.getEntriesCountByDepartment("12", null);

    assert.deepStrictEqual(entriesCountResult, err("notAllowed"));
  });
});

describe("Find department by city ID", () => {
  test("should handle a found department", async () => {
    const departmentData = departmentFactory.build({
      id: "256",
    });
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartmentByTownId.mockImplementationOnce(() => Promise.resolve(departmentData));

    const departmentResult = await departmentService.findDepartmentOfTownId("43", loggedUser);

    assert.strictEqual(departmentRepository.findDepartmentByTownId.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.findDepartmentByTownId.mock.calls[0], [43]);
    assert.ok(departmentResult.isOk());
    assert.strictEqual(departmentResult.value?.id, "256");
  });

  test("should not be allowed when the requester is not logged", async () => {
    const findResult = await departmentService.findDepartmentOfTownId("12", null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
  });
});

test("Find all departments", async () => {
  const departmentsData = departmentFactory.buildList(3);

  departmentRepository.findDepartments.mockImplementationOnce(() => Promise.resolve(departmentsData));

  await departmentService.findAllDepartments();

  assert.strictEqual(departmentRepository.findDepartments.mock.calls.length, 1);
  assert.deepStrictEqual(departmentRepository.findDepartments.mock.calls[0], [
    {
      orderBy: "code",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const departmentsData = departmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    departmentRepository.findDepartments.mockImplementationOnce(() => Promise.resolve(departmentsData));

    await departmentService.findPaginatedDepartments(loggedUser, {});

    assert.strictEqual(departmentRepository.findDepartments.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.findDepartments.mock.calls[0], [
      { limit: undefined, offset: undefined, orderBy: undefined, q: undefined, sortOrder: undefined },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated departments", async () => {
    const departmentsData = departmentFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: DepartmentsSearchParams = {
      orderBy: "code",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    departmentRepository.findDepartments.mockImplementationOnce(() => Promise.resolve([departmentsData[0]]));

    await departmentService.findPaginatedDepartments(loggedUser, searchParams);

    assert.strictEqual(departmentRepository.findDepartments.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.findDepartments.mock.calls[0], [
      {
        q: "Bob",
        orderBy: "code",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await departmentService.findPaginatedDepartments(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getDepartmentsCount(loggedUser);

    assert.strictEqual(departmentRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.getCount.mock.calls[0], [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await departmentService.getDepartmentsCount(loggedUser, "test");

    assert.strictEqual(departmentRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.getCount.mock.calls[0], ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await departmentService.getDepartmentsCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of a department", () => {
  test("should be allowed when user has permission", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { department: { canEdit: true } } });

    departmentRepository.updateDepartment.mockImplementationOnce(() => Promise.resolve(ok(departmentFactory.build())));

    await departmentService.updateDepartment(12, departmentData, loggedUser);

    assert.strictEqual(departmentRepository.updateDepartment.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.updateDepartment.mock.calls[0], [12, departmentData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = departmentFactory.build({
      ownerId: "notAdmin",
    });

    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    departmentRepository.findDepartmentById.mockImplementationOnce(() => Promise.resolve(existingData));
    departmentRepository.updateDepartment.mockImplementationOnce(() => Promise.resolve(ok(departmentFactory.build())));

    await departmentService.updateDepartment(12, departmentData, loggedUser);

    assert.strictEqual(departmentRepository.updateDepartment.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.updateDepartment.mock.calls[0], [12, departmentData]);
  });

  test("should not be allowed when requested by an user that is nor owner nor has permission", async () => {
    const existingData = departmentFactory.build({
      ownerId: "notAdmin",
    });

    const departmentData = upsertDepartmentInputFactory.build();

    const user = loggedUserFactory.build();

    departmentRepository.findDepartmentById.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await departmentService.updateDepartment(12, departmentData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(departmentRepository.updateDepartment.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to a department that exists", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { department: { canEdit: true } } });

    departmentRepository.updateDepartment.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await departmentService.updateDepartment(12, departmentData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(departmentRepository.updateDepartment.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.updateDepartment.mock.calls[0], [12, departmentData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const updateResult = await departmentService.updateDepartment(12, departmentData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(departmentRepository.updateDepartment.mock.calls.length, 0);
  });
});

describe("Creation of a department", () => {
  test("should create new department", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { department: { canCreate: true } } });

    departmentRepository.createDepartment.mockImplementationOnce(() => Promise.resolve(ok(departmentFactory.build())));

    await departmentService.createDepartment(departmentData, loggedUser);

    assert.strictEqual(departmentRepository.createDepartment.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.createDepartment.mock.calls[0], [
      {
        ...departmentData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create a department that already exists", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { department: { canCreate: true } } });

    departmentRepository.createDepartment.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await departmentService.createDepartment(departmentData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(departmentRepository.createDepartment.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.createDepartment.mock.calls[0], [
      {
        ...departmentData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { department: { canCreate: false } } });

    const createResult = await departmentService.createDepartment(departmentData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(departmentRepository.createDepartment.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const departmentData = upsertDepartmentInputFactory.build();

    const createResult = await departmentService.createDepartment(departmentData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(departmentRepository.createDepartment.mock.calls.length, 0);
  });
});

describe("Deletion of a department", () => {
  test("hould handle the deletion of an owned department", async () => {
    const loggedUser = loggedUserFactory.build({ id: "12" });

    const department = departmentFactory.build({
      ownerId: loggedUser.id,
    });

    departmentRepository.findDepartmentById.mockImplementationOnce(() => Promise.resolve(department));

    await departmentService.deleteDepartment(11, loggedUser);

    assert.strictEqual(departmentRepository.deleteDepartmentById.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.deleteDepartmentById.mock.calls[0], [11]);
  });

  test("should handle the deletion of any department if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { department: { canDelete: true } } });

    departmentRepository.findDepartmentById.mockImplementationOnce(() => Promise.resolve(departmentFactory.build()));

    await departmentService.deleteDepartment(11, loggedUser);

    assert.strictEqual(departmentRepository.deleteDepartmentById.mock.calls.length, 1);
    assert.deepStrictEqual(departmentRepository.deleteDepartmentById.mock.calls[0], [11]);
  });

  test("should not be allowed when deleting a non-owned department and no permission", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await departmentService.deleteDepartment(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(departmentRepository.deleteDepartmentById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { department: { canDelete: true } } });

    townRepository.getCount.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await departmentService.deleteDepartment(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(departmentRepository.deleteDepartmentById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await departmentService.deleteDepartment(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(departmentRepository.deleteDepartmentById.mock.calls.length, 0);
  });
});

test("Create multiple departments", async () => {
  const departmentsData = upsertDepartmentInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  departmentRepository.createDepartments.mockImplementationOnce(() => Promise.resolve([]));

  await departmentService.createDepartments(departmentsData, loggedUser);

  assert.strictEqual(departmentRepository.createDepartments.mock.calls.length, 1);
  assert.deepStrictEqual(departmentRepository.createDepartments.mock.calls[0], [
    departmentsData.map((department) => {
      return {
        ...department,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
