import { faker } from "@faker-js/faker";
import type { UpsertAgeInput } from "@ou-ca/common/api/age.js";
import type { Age } from "@ou-ca/common/api/entities/age.js";
import { Factory } from "fishery";

export const ageServiceFactory = Factory.define<Age>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertAgeInputFactory = Factory.define<UpsertAgeInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
