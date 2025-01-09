import { faker } from "@faker-js/faker";
import type { UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate.js";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate.js";
import { Factory } from "fishery";

export const distanceEstimateServiceFactory = Factory.define<DistanceEstimate>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertDistanceEstimateInputFactory = Factory.define<UpsertDistanceEstimateInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
