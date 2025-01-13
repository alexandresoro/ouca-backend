import { faker } from "@faker-js/faker";
import type { UpsertLocalityInput } from "@ou-ca/common/api/locality.js";
import { Factory } from "fishery";

export const upsertLocalityInputFactory = Factory.define<UpsertLocalityInput>(() => {
  return {
    townId: faker.string.sample(),
    nom: faker.string.alpha(),
    altitude: faker.number.int({ max: 9000, min: -1000 }),
    longitude: faker.number.int({ max: 180, min: -180 }),
    latitude: faker.number.int({ max: 90, min: -90 }),
  };
});
