import type { Environment, EnvironmentCreateInput } from "@domain/environment/environment.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const environmentFactory = Factory.define<Environment>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const environmentCreateInputFactory = Factory.define<EnvironmentCreateInput>(() => {
  return {
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
