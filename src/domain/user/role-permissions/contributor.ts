import type { Permissions } from "../permissions.js";

export const CONTRIBUTOR_PERMISSIONS = Object.freeze({
  observer: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  department: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  town: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  locality: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  weather: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  speciesClass: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  species: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  age: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  sex: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  numberEstimate: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  distanceEstimate: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  behavior: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  environment: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
  },
  canViewAllEntries: false,
  canManageAllEntries: false,
  canImport: true,
}) satisfies Permissions;
