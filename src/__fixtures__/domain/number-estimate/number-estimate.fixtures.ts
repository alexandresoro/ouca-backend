import type { NumberEstimate, NumberEstimateCreateInput } from "@domain/number-estimate/number-estimate.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const numberEstimateFactory = Factory.define<NumberEstimate>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    nonCompte: faker.datatype.boolean(),
    ownerId: faker.string.uuid(),
  };
});

export const numberEstimateCreateInputFactory = Factory.define<NumberEstimateCreateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    nonCompte: faker.datatype.boolean(),
    ownerId: faker.string.uuid(),
  };
});
