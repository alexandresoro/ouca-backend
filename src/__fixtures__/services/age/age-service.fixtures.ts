import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import type { UpsertAgeInput } from "../../../application/services/age/age-service.js";

export const upsertAgeInputFactory = Factory.define<UpsertAgeInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
