import { faker } from "@faker-js/faker";
import type { UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate.js";
import { Factory } from "fishery";

export const upsertDistanceEstimateInputFactory = Factory.define<UpsertDistanceEstimateInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
