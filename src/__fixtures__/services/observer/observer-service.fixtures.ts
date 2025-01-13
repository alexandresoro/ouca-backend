import { faker } from "@faker-js/faker";
import type { UpsertObserverInput } from "@ou-ca/common/api/observer.js";
import { Factory } from "fishery";

export const upsertObserverInputFactory = Factory.define<UpsertObserverInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
