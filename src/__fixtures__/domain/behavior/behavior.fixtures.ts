import type { Behavior, BehaviorCreateInput } from "@domain/behavior/behavior.js";
import { BREEDER_CODES } from "@domain/behavior/breeder.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const behaviorFactory = Factory.define<Behavior>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    nicheur: faker.helpers.arrayElement(BREEDER_CODES),
    ownerId: faker.string.uuid(),
  };
});

export const behaviorCreateInputFactory = Factory.define<BehaviorCreateInput>(() => {
  return {
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    nicheur: faker.helpers.arrayElement(BREEDER_CODES),
    ownerId: faker.string.uuid(),
  };
});
