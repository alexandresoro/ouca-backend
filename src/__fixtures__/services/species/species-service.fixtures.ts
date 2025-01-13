import { faker } from "@faker-js/faker";
import type { UpsertSpeciesInput } from "@ou-ca/common/api/species.js";
import { Factory } from "fishery";

export const upsertSpeciesInputFactory = Factory.define<UpsertSpeciesInput>(() => {
  return {
    classId: faker.string.alphanumeric(),
    code: faker.string.alpha(),
    nomFrancais: faker.string.alpha(),
    nomLatin: faker.string.alpha(),
  };
});
