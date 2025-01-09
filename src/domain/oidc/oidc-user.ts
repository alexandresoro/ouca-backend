import { userRoles } from "@domain/user/user-role.js";
import { z } from "zod";

// Standard schema for introspection of any OIDC user
// This schema reuses standard OIDC claims and adds non-standard claims (e.g. roles)
export const oidcUser = z.object({
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
  // The following lines are non-standard claims
  oidcProvider: z.string(),
  roles: z.array(z.enum(userRoles)),
});

export type OIDCUser = z.infer<typeof oidcUser>;
