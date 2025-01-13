import { faker } from "@faker-js/faker";
import type { UpsertDepartmentInput } from "@ou-ca/common/api/department.js";
import { Factory } from "fishery";

export const upsertDepartmentInputFactory = Factory.define<UpsertDepartmentInput>(() => {
  return {
    code: faker.string.alpha(),
  };
});
