import { z } from "zod";

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

export const userSchema = z.object({
  id: z.string(),
  extProviderName: z.string().nullable(),
  extProviderId: z.string().nullable(),
  settings: userSettingsSchema,
});

export type User = z.infer<typeof userSchema>;

export type CreateUserInput = {
  extProvider: string;
  extProviderUserId: string;
};
