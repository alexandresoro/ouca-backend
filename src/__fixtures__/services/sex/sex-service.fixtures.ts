import { faker } from "@faker-js/faker";
import type { UpsertSexInput } from "@ou-ca/common/api/sex.js";
import { Factory } from "fishery";

export const upsertSexInputFactory = Factory.define<UpsertSexInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
