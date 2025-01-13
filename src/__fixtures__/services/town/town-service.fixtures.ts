import { faker } from "@faker-js/faker";
import type { UpsertTownInput } from "@ou-ca/common/api/town.js";
import { Factory } from "fishery";

export const upsertTownInputFactory = Factory.define<UpsertTownInput>(() => {
  return {
    code: faker.number.int(),
    nom: faker.string.alpha(),
    departmentId: faker.string.alpha(),
  };
});
