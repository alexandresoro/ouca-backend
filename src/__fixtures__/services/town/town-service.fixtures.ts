import { faker } from "@faker-js/faker";
import type { Town } from "@ou-ca/common/api/entities/town.js";
import type { UpsertTownInput } from "@ou-ca/common/api/town.js";
import { Factory } from "fishery";

export const townServiceFactory = Factory.define<Town>(() => {
  return {
    id: faker.string.sample(),
    code: faker.number.int(),
    nom: faker.string.alpha(),
    departmentId: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertTownInputFactory = Factory.define<UpsertTownInput>(() => {
  return {
    code: faker.number.int(),
    nom: faker.string.alpha(),
    departmentId: faker.string.alpha(),
  };
});
