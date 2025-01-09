import { faker } from "@faker-js/faker";
import type { UpsertDepartmentInput } from "@ou-ca/common/api/department.js";
import type { Department } from "@ou-ca/common/api/entities/department.js";
import { Factory } from "fishery";

export const departmentServiceFactory = Factory.define<Department>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertDepartmentInputFactory = Factory.define<UpsertDepartmentInput>(() => {
  return {
    code: faker.string.alpha(),
  };
});
