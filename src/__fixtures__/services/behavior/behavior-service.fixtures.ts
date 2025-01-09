import { faker } from "@faker-js/faker";
import type { UpsertBehaviorInput } from "@ou-ca/common/api/behavior.js";
import type { Behavior } from "@ou-ca/common/api/entities/behavior.js";
import { NICHEUR_CODES } from "@ou-ca/common/types/nicheur.model.js";
import { Factory } from "fishery";

export const behaviorServiceFactory = Factory.define<Behavior>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    nicheur: faker.helpers.arrayElement(NICHEUR_CODES),
    ownerId: faker.string.uuid(),
  };
});

export const upsertBehaviorInputFactory = Factory.define<UpsertBehaviorInput>(() => {
  return {
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    nicheur: faker.helpers.arrayElement(NICHEUR_CODES),
  };
});
