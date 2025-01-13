import { faker } from "@faker-js/faker";
import type { UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate.js";
import { Factory } from "fishery";

export const upsertNumberEstimateInputFactory = Factory.define<UpsertNumberEstimateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    nonCompte: faker.datatype.boolean(),
  };
});
