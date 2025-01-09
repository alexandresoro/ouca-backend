import { faker } from "@faker-js/faker";
import type { UpsertInventoryInput } from "@ou-ca/common/api/inventory.js";
import { Factory } from "fishery";

export const upsertInventoryInputFactory = Factory.define<UpsertInventoryInput>(() => {
  return {
    observerId: faker.string.alphanumeric(),
    associateIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    date: faker.date.recent().toISOString().split("T")[0],
    time: faker.helpers.fromRegExp(/[01]?[0-9]:[0-5][0-9]/),
    duration: faker.number.int({ max: 5999 }),
    localityId: faker.string.alphanumeric(),
    coordinates: {
      altitude: faker.number.int({ max: 9000, min: -1000 }),
      longitude: faker.number.int({ max: 180, min: -180 }),
      latitude: faker.number.int({ max: 90, min: -90 }),
    },
    temperature: faker.number.int(),
    weatherIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    migrateDonneesIfMatchesExistingInventaire: faker.datatype.boolean(),
  };
});
