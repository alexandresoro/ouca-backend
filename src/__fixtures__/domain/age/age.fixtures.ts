import type { Age, AgeCreateInput } from "@domain/age/age.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const ageFactory = Factory.define<Age>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const ageCreateInputFactory = Factory.define<AgeCreateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
