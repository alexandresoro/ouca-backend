import { faker } from "@faker-js/faker";
import type { Observer } from "@ou-ca/common/api/entities/observer.js";
import type { UpsertObserverInput } from "@ou-ca/common/api/observer.js";
import { Factory } from "fishery";

export const observerServiceFactory = Factory.define<Observer>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});

export const upsertObserverInputFactory = Factory.define<UpsertObserverInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
