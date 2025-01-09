import type { Species, SpeciesCreateInput } from "@domain/species/species.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const speciesFactory = Factory.define<Species>(() => {
  return {
    id: faker.string.sample(),
    classId: faker.string.alphanumeric(),
    code: faker.string.alpha(),
    nomFrancais: faker.string.alpha(),
    nomLatin: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const speciesCreateInputFactory = Factory.define<SpeciesCreateInput>(() => {
  return {
    classId: faker.string.alphanumeric(),
    code: faker.string.alpha(),
    nomFrancais: faker.string.alpha(),
    nomLatin: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
