import type { Inventory, InventoryCreateInput } from "@domain/inventory/inventory.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const inventoryFactory = Factory.define<Inventory>(() => {
  return {
    id: faker.string.uuid(),
    observerId: faker.string.alphanumeric(),
    associateIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    date: faker.date.recent(),
    time: faker.string.alpha(),
    duration: faker.string.alpha(),
    localityId: faker.string.alphanumeric(),
    customizedCoordinates: {
      altitude: faker.number.int(),
      longitude: faker.number.float(),
      latitude: faker.number.float(),
    },
    temperature: faker.number.int(),
    weatherIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    creationDate: faker.date.recent(),
    ownerId: faker.string.uuid(),
  };
});

export const inventoryCreateInputFactory = Factory.define<InventoryCreateInput>(() => {
  return {
    observerId: faker.string.alphanumeric(),
    associateIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    date: faker.date.recent().toISOString().split("T")[0],
    time: faker.string.alpha(),
    duration: faker.string.alpha(),
    localityId: faker.string.alphanumeric(),
    customizedCoordinates: {
      altitude: faker.number.int(),
      longitude: faker.number.float(),
      latitude: faker.number.float(),
    },
    temperature: faker.number.int(),
    weatherIds: faker.helpers.multiple(() => faker.string.alphanumeric()),
    ownerId: faker.string.uuid(),
  };
});
