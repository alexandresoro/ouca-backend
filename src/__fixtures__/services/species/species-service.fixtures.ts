import { faker } from "@faker-js/faker";
import { speciesClassServiceFactory } from "@fixtures/services/species-class/species-class-service.fixtures.js";
import type { Species } from "@ou-ca/common/api/entities/species.js";
import type { UpsertSpeciesInput } from "@ou-ca/common/api/species.js";
import { Factory } from "fishery";

export const speciesServiceFactory = Factory.define<Species>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alpha(),
    nomFrancais: faker.string.alpha(),
    nomLatin: faker.string.alpha(),
    classId: faker.string.sample(),
    speciesClass: speciesClassServiceFactory.build(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertSpeciesInputFactory = Factory.define<UpsertSpeciesInput>(() => {
  return {
    classId: faker.string.alphanumeric(),
    code: faker.string.alpha(),
    nomFrancais: faker.string.alpha(),
    nomLatin: faker.string.alpha(),
  };
});
