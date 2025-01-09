import type { Locality, LocalityCreateInput } from "@domain/locality/locality.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const localityFactory = Factory.define<Locality>(() => {
  return {
    id: faker.string.sample(),
    townId: faker.string.alphanumeric(),
    nom: faker.string.alpha(),
    altitude: faker.number.int(),
    longitude: faker.number.float(),
    latitude: faker.number.float(),
    ownerId: faker.string.uuid(),
  };
});

export const localityCreateInputFactory = Factory.define<LocalityCreateInput>(() => {
  return {
    townId: faker.string.alphanumeric(),
    nom: faker.string.alpha(),
    altitude: faker.number.int(),
    longitude: faker.number.float(),
    latitude: faker.number.float(),
    ownerId: faker.string.uuid(),
  };
});
