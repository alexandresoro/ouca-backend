import { faker } from "@faker-js/faker";
import type { SpeciesClass } from "@ou-ca/common/api/entities/species-class.js";
import type { UpsertClassInput } from "@ou-ca/common/api/species-class.js";
import { Factory } from "fishery";

export const speciesClassServiceFactory = Factory.define<SpeciesClass>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertSpeciesClassInputFactory = Factory.define<UpsertClassInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
