import type { LoggedUser } from "@domain/user/logged-user.js";
import { NO_ENTITY_PERMISSION } from "@domain/user/permissions.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const loggedUserFactory = Factory.define<LoggedUser>(() => {
  return {
    id: faker.string.uuid(),
    permissions: {
      observer: NO_ENTITY_PERMISSION,
      department: NO_ENTITY_PERMISSION,
      town: NO_ENTITY_PERMISSION,
      locality: NO_ENTITY_PERMISSION,
      weather: NO_ENTITY_PERMISSION,
      speciesClass: NO_ENTITY_PERMISSION,
      species: NO_ENTITY_PERMISSION,
      age: NO_ENTITY_PERMISSION,
      sex: NO_ENTITY_PERMISSION,
      numberEstimate: NO_ENTITY_PERMISSION,
      distanceEstimate: NO_ENTITY_PERMISSION,
      behavior: NO_ENTITY_PERMISSION,
      environment: NO_ENTITY_PERMISSION,
      canViewAllEntries: false,
      canManageAllEntries: false,
      canImport: false,
    },
  };
});
