import { z } from "zod";

/**
 * `GET` `/me`
 *  Retrieve own user profile
 */
const userSettingsSchema = z
  .object({
    defaultObserverId: z.string().optional(),
    defaultDepartmentId: z.string().optional(),
    defaultAgeId: z.string().optional(),
    defaultSexId: z.string().optional(),
    defaultNumberEstimateId: z.string().optional(),
    defaultNumber: z.number().optional(),
    displayAssociates: z.boolean().optional(),
    displayWeather: z.boolean().optional(),
    displayDistance: z.boolean().optional(),
  })
  .nullable();

const getMeUser = z.object({
  sub: z.string(),
  iss: z.string(),
  username: z.string().optional(),
  exp: z.number(), // Expiration date as unix time
  email: z.string().optional(),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  given_name: z.string().optional(),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  family_name: z.string().optional(),
  name: z.string().optional(),
});

const entityPermissionSchema = z.object({
  canCreate: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
});

const permissionsSchema = z.object({
  observer: entityPermissionSchema,
  department: entityPermissionSchema,
  town: entityPermissionSchema,
  locality: entityPermissionSchema,
  weather: entityPermissionSchema,
  speciesClass: entityPermissionSchema,
  species: entityPermissionSchema,
  age: entityPermissionSchema,
  sex: entityPermissionSchema,
  numberEstimate: entityPermissionSchema,
  distanceEstimate: entityPermissionSchema,
  behavior: entityPermissionSchema,
  environment: entityPermissionSchema,
  canViewAllEntries: z.boolean(),
  canImport: z.boolean(),
});

export const getMeResponse = z.object({
  id: z.string().uuid(),
  user: getMeUser,
  settings: userSettingsSchema,
  permissions: permissionsSchema,
});

export type GetMeResponse = z.infer<typeof getMeResponse>;

/**
 * `PUT` `/me`
 * Update of user settings
 */
export const putMeInput = z.object({
  defaultDepartment: z.string().nullable(),
  defaultObserver: z.string().nullable(),
  defaultEstimationNombre: z.string().nullable(),
  defaultNombre: z.coerce.number().min(1).max(65535).nullable(),
  defaultSexe: z.string().nullable(),
  defaultAge: z.string().nullable(),
  areAssociesDisplayed: z.boolean(),
  isMeteoDisplayed: z.boolean(),
  isDistanceDisplayed: z.boolean(),
});

export type PutMeInput = z.infer<typeof putMeInput>;
