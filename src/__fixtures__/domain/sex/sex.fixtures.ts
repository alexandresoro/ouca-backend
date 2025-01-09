import type { Sex, SexCreateInput } from "@domain/sex/sex.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const sexFactory = Factory.define<Sex>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const sexCreateInputFactory = Factory.define<SexCreateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
