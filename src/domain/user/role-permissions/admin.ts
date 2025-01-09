import { ALL_ENTITY_PERMISSIONS, type Permissions } from "../permissions.js";

export const ADMIN_PERMISSIONS = Object.freeze({
  observer: ALL_ENTITY_PERMISSIONS,
  department: ALL_ENTITY_PERMISSIONS,
  town: ALL_ENTITY_PERMISSIONS,
  locality: ALL_ENTITY_PERMISSIONS,
  weather: ALL_ENTITY_PERMISSIONS,
  speciesClass: ALL_ENTITY_PERMISSIONS,
  species: ALL_ENTITY_PERMISSIONS,
  age: ALL_ENTITY_PERMISSIONS,
  sex: ALL_ENTITY_PERMISSIONS,
  numberEstimate: ALL_ENTITY_PERMISSIONS,
  distanceEstimate: ALL_ENTITY_PERMISSIONS,
  behavior: ALL_ENTITY_PERMISSIONS,
  environment: ALL_ENTITY_PERMISSIONS,
  canViewAllEntries: true,
  canManageAllEntries: true,
  canImport: true,
}) satisfies Permissions;
