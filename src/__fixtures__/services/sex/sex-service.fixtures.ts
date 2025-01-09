import { faker } from "@faker-js/faker";
import type { Sex } from "@ou-ca/common/api/entities/sex.js";
import type { UpsertSexInput } from "@ou-ca/common/api/sex.js";
import { Factory } from "fishery";

export const sexServiceFactory = Factory.define<Sex>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertSexInputFactory = Factory.define<UpsertSexInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
