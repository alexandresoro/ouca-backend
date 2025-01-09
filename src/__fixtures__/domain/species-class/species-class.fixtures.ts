import type { SpeciesClass, SpeciesClassCreateInput } from "@domain/species-class/species-class.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const speciesClassFactory = Factory.define<SpeciesClass>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const weatherCreateInputFactory = Factory.define<SpeciesClassCreateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
