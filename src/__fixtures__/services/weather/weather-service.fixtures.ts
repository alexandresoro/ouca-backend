import { faker } from "@faker-js/faker";
import type { Weather } from "@ou-ca/common/api/entities/weather.js";
import type { UpsertWeatherInput } from "@ou-ca/common/api/weather.js";
import { Factory } from "fishery";

export const weatherServiceFactory = Factory.define<Weather>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertWeatherInputFactory = Factory.define<UpsertWeatherInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
