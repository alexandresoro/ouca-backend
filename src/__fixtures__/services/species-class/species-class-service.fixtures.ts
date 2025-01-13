import { faker } from "@faker-js/faker";
import type { UpsertClassInput } from "@ou-ca/common/api/species-class.js";
import { Factory } from "fishery";

export const upsertSpeciesClassInputFactory = Factory.define<UpsertClassInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
