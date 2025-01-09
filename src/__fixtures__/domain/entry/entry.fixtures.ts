import type { Entry, EntryCreateInput } from "@domain/entry/entry.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const entryFactory = Factory.define<Entry>(() => {
  return {
    id: faker.string.uuid(),
    inventoryId: faker.string.alphanumeric(),
    speciesId: faker.string.alphanumeric(),
    sexId: faker.string.alphanumeric(),
    ageId: faker.string.alphanumeric(),
    numberEstimateId: faker.string.alphanumeric(),
    number: faker.number.int(),
    distanceEstimateId: faker.string.alphanumeric(),
    distance: faker.number.int(),
    behaviorIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    environmentIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    comment: faker.lorem.sentence(),
    creationDate: faker.date.recent(),
  };
});

export const entryCreateInputFactory = Factory.define<EntryCreateInput>(() => {
  return {
    inventoryId: faker.string.alphanumeric(),
    speciesId: faker.string.alphanumeric(),
    sexId: faker.string.alphanumeric(),
    ageId: faker.string.alphanumeric(),
    numberEstimateId: faker.string.alphanumeric(),
    number: faker.number.int(),
    distanceEstimateId: faker.string.alphanumeric(),
    distance: faker.number.int(),
    behaviorIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    environmentIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    comment: faker.lorem.sentence(),
  };
});
