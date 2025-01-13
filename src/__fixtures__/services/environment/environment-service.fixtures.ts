import { faker } from "@faker-js/faker";
import type { UpsertEnvironmentInput } from "@ou-ca/common/api/environment.js";
import { Factory } from "fishery";

export const upsertEnvironmentInputFactory = Factory.define<UpsertEnvironmentInput>(() => {
  return {
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
  };
});
