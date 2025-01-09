import type { Department, DepartmentCreateInput } from "@domain/department/department.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const departmentFactory = Factory.define<Department>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const departmentCreateInputFactory = Factory.define<DepartmentCreateInput>(() => {
  return {
    code: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
