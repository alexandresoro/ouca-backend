import type { DistanceEstimate, DistanceEstimateCreateInput } from "@domain/distance-estimate/distance-estimate.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const distanceEstimateFactory = Factory.define<DistanceEstimate>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const distanceEstimateCreateInputFactory = Factory.define<DistanceEstimateCreateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
