import { faker } from "@faker-js/faker";
import type { UpsertEntryInput } from "@ou-ca/common/api/entry.js";
import { Factory } from "fishery";

export const upsertEntryInputFactory = Factory.define<UpsertEntryInput>(() => {
  return {
    inventoryId: faker.string.alphanumeric(),
    speciesId: faker.string.alphanumeric(),
    sexId: faker.string.alphanumeric(),
    ageId: faker.string.alphanumeric(),
    numberEstimateId: faker.string.alphanumeric(),
    number: faker.number.int(),
    distanceEstimateId: faker.string.alphanumeric(),
    distance: faker.number.int(),
    comment: faker.lorem.sentence(),
    behaviorIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    environmentIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
  };
});
