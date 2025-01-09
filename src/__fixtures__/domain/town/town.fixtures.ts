import type { Town, TownCreateInput } from "@domain/town/town.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const townFactory = Factory.define<Town>(() => {
  return {
    id: faker.string.sample(),
    departmentId: faker.string.numeric(),
    code: faker.number.int(),
    nom: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const townCreateInputFactory = Factory.define<TownCreateInput>(() => {
  return {
    departmentId: faker.string.numeric(),
    code: faker.number.int(),
    nom: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
