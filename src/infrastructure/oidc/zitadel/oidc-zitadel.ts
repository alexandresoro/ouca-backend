import type { OIDCIntrospectionResult } from "@domain/oidc/oidc-introspection.js";
import { type OIDCUser, oidcUser } from "@domain/oidc/oidc-user.js";
import { type Result, err, ok } from "neverthrow";
import { z } from "zod";
import { logger } from "../../../utils/logger.js";

const zitadelIntrospectionUser = z.object({
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
  "urn:zitadel:iam:org:project:roles": z
    .record(z.string(), z.any())
    .optional()
    .transform((rolesMap) => (rolesMap ? Object.keys(rolesMap) : undefined)),
});

type ZitadelIntrospectionUser = z.infer<typeof zitadelIntrospectionUser>;

const zitadelIntrospectionResultSchema = z.union([
  z.object({
    active: z.literal(false),
  }),
  zitadelIntrospectionUser.merge(
    z.object({
      active: z.literal(true),
    }),
  ),
]);

const reshapeZitadelIntrospectionUser = (
  zitadelUser: ZitadelIntrospectionUser,
): Result<OIDCUser, "zodSchemaParseError"> => {
  const roles = zitadelUser["urn:zitadel:iam:org:project:roles"] ?? [];

  const oidcUserParseResult = oidcUser.safeParse({
    ...zitadelUser,
    roles,
    oidcProvider: "zitadel",
  });

  if (!oidcUserParseResult.success) {
    logger.error(
      { oidcUserParseResult, zitadelUser },
      "An error has occurred while trying to map Zitadel introspection user to OIDC user",
    );
    return err("zodSchemaParseError");
  }

  return ok(oidcUserParseResult.data);
};

export const parseZitadelIntrospectionResult = (
  responseBody: unknown,
): Result<OIDCIntrospectionResult, "zodSchemaParseError"> => {
  const parsedResponse = zitadelIntrospectionResultSchema.safeParse(responseBody);

  if (!parsedResponse.success) {
    logger.error({ parsedResponse }, "An error has occurred while trying to parse the introspection result");
    return err("zodSchemaParseError");
  }

  const parsedData = parsedResponse.data;

  if (parsedData.active === false) {
    return ok({ active: false });
  }

  return reshapeZitadelIntrospectionUser(parsedData).map((user) => {
    return { active: true, user };
  });
};
