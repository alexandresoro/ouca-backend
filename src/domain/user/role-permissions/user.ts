import { NO_ENTITY_PERMISSION, type Permissions } from "../permissions.js";

export const USER_PERMISSIONS = Object.freeze({
  observer: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
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
}) satisfies Permissions;
