import { faker } from "@faker-js/faker";
import type { Environment } from "@ou-ca/common/api/entities/environment.js";
import type { UpsertEnvironmentInput } from "@ou-ca/common/api/environment.js";
import { Factory } from "fishery";

export const environmentServiceFactory = Factory.define<Environment>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertEnvironmentInputFactory = Factory.define<UpsertEnvironmentInput>(() => {
  return {
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
  };
});
