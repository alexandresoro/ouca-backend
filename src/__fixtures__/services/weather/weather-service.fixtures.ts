import { faker } from "@faker-js/faker";
import type { UpsertWeatherInput } from "@ou-ca/common/api/weather.js";
import { Factory } from "fishery";

export const upsertWeatherInputFactory = Factory.define<UpsertWeatherInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
