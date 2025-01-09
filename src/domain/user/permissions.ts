type EntityPermission = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type Permissions = {
  observer: EntityPermission;
  department: EntityPermission;
  town: EntityPermission;
  locality: EntityPermission;
  weather: EntityPermission;
  speciesClass: EntityPermission;
  species: EntityPermission;
  age: EntityPermission;
  sex: EntityPermission;
  numberEstimate: EntityPermission;
  distanceEstimate: EntityPermission;
  behavior: EntityPermission;
  environment: EntityPermission;

  canViewAllEntries: boolean;
  canManageAllEntries: boolean;

  canImport: boolean;
};

export const NO_ENTITY_PERMISSION = Object.freeze({
  canCreate: false,
  canEdit: false,
  canDelete: false,
}) satisfies EntityPermission;

export const ALL_ENTITY_PERMISSIONS = Object.freeze({
  canCreate: true,
  canEdit: true,
  canDelete: true,
}) satisfies EntityPermission;

const NO_PERMISSIONS = Object.freeze({
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
}) satisfies Permissions;

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const mergePermissions = (permissions: DeepPartial<Permissions>[]): Permissions => {
  return permissions.reduce((acc: Permissions, permission) => {
    return {
      observer: {
        canCreate: acc.observer.canCreate || (permission.observer?.canCreate ?? false),
        canEdit: acc.observer.canEdit || (permission.observer?.canEdit ?? false),
        canDelete: acc.observer.canDelete || (permission.observer?.canDelete ?? false),
      },
      department: {
        canCreate: acc.department.canCreate || (permission.department?.canCreate ?? false),
        canEdit: acc.department.canEdit || (permission.department?.canEdit ?? false),
        canDelete: acc.department.canDelete || (permission.department?.canDelete ?? false),
      },
      town: {
        canCreate: acc.town.canCreate || (permission.town?.canCreate ?? false),
        canEdit: acc.town.canEdit || (permission.town?.canEdit ?? false),
        canDelete: acc.town.canDelete || (permission.town?.canDelete ?? false),
      },
      locality: {
        canCreate: acc.locality.canCreate || (permission.locality?.canCreate ?? false),
        canEdit: acc.locality.canEdit || (permission.locality?.canEdit ?? false),
        canDelete: acc.locality.canDelete || (permission.locality?.canDelete ?? false),
      },
      weather: {
        canCreate: acc.weather.canCreate || (permission.weather?.canCreate ?? false),
        canEdit: acc.weather.canEdit || (permission.weather?.canEdit ?? false),
        canDelete: acc.weather.canDelete || (permission.weather?.canDelete ?? false),
      },
      speciesClass: {
        canCreate: acc.speciesClass.canCreate || (permission.speciesClass?.canCreate ?? false),
        canEdit: acc.speciesClass.canEdit || (permission.speciesClass?.canEdit ?? false),
        canDelete: acc.speciesClass.canDelete || (permission.speciesClass?.canDelete ?? false),
      },
      species: {
        canCreate: acc.species.canCreate || (permission.species?.canCreate ?? false),
        canEdit: acc.species.canEdit || (permission.species?.canEdit ?? false),
        canDelete: acc.species.canDelete || (permission.species?.canDelete ?? false),
      },
      age: {
        canCreate: acc.age.canCreate || (permission.age?.canCreate ?? false),
        canEdit: acc.age.canEdit || (permission.age?.canEdit ?? false),
        canDelete: acc.age.canDelete || (permission.age?.canDelete ?? false),
      },
      sex: {
        canCreate: acc.sex.canCreate || (permission.sex?.canCreate ?? false),
        canEdit: acc.sex.canEdit || (permission.sex?.canEdit ?? false),
        canDelete: acc.sex.canDelete || (permission.sex?.canDelete ?? false),
      },
      numberEstimate: {
        canCreate: acc.numberEstimate.canCreate || (permission.numberEstimate?.canCreate ?? false),
        canEdit: acc.numberEstimate.canEdit || (permission.numberEstimate?.canEdit ?? false),
        canDelete: acc.numberEstimate.canDelete || (permission.numberEstimate?.canDelete ?? false),
      },
      distanceEstimate: {
        canCreate: acc.distanceEstimate.canCreate || (permission.distanceEstimate?.canCreate ?? false),
        canEdit: acc.distanceEstimate.canEdit || (permission.distanceEstimate?.canEdit ?? false),
        canDelete: acc.distanceEstimate.canDelete || (permission.distanceEstimate?.canDelete ?? false),
      },
      behavior: {
        canCreate: acc.behavior.canCreate || (permission.behavior?.canCreate ?? false),
        canEdit: acc.behavior.canEdit || (permission.behavior?.canEdit ?? false),
        canDelete: acc.behavior.canDelete || (permission.behavior?.canDelete ?? false),
      },
      environment: {
        canCreate: acc.environment.canCreate || (permission.environment?.canCreate ?? false),
        canEdit: acc.environment.canEdit || (permission.environment?.canEdit ?? false),
        canDelete: acc.environment.canDelete || (permission.environment?.canDelete ?? false),
      },
      canViewAllEntries: acc.canViewAllEntries || (permission.canViewAllEntries ?? false),
      canManageAllEntries: acc.canManageAllEntries || (permission.canManageAllEntries ?? false),
      canImport: acc.canImport || (permission.canImport ?? false),
    };
  }, NO_PERMISSIONS);
};
