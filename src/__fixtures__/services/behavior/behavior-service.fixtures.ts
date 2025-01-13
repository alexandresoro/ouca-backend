import { BREEDER_CODES } from "@domain/behavior/breeder.js";
import { faker } from "@faker-js/faker";
import type { UpsertBehaviorInput } from "@ou-ca/common/api/behavior.js";
import { Factory } from "fishery";

export const upsertBehaviorInputFactory = Factory.define<UpsertBehaviorInput>(() => {
  return {
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    nicheur: faker.helpers.arrayElement(BREEDER_CODES),
  };
});
