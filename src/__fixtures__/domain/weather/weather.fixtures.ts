import type { Weather, WeatherCreateInput } from "@domain/weather/weather.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const weatherFactory = Factory.define<Weather>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const weatherCreateInputFactory = Factory.define<WeatherCreateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
