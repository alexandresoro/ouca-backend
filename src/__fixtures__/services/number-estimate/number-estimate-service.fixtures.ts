import { faker } from "@faker-js/faker";
import type { NumberEstimate } from "@ou-ca/common/api/entities/number-estimate.js";
import type { UpsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate.js";
import { Factory } from "fishery";

export const numberEstimateServiceFactory = Factory.define<NumberEstimate>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    nonCompte: faker.datatype.boolean(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertNumberEstimateInputFactory = Factory.define<UpsertNumberEstimateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    nonCompte: faker.datatype.boolean(),
  };
});
