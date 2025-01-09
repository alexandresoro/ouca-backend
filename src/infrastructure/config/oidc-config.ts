import { z } from "zod";
import { logger } from "../../utils/logger.js";

const envOidcSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OIDC_PROVIDER: z.enum(["zitadel"]).default("zitadel"), // TODO: Remove default value at some point
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OIDC_ISSUER: z.string(),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OIDC_INTROSPECTION_PATH: z.string().default("/oauth/v2/introspect"),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OIDC_CLIENT_ID: z.string(),
  // biome-ignore lint/style/useNamingConvention: <explanation>
  OIDC_CLIENT_SECRET: z.string(),
});

export const getOidcConfig = () => {
  const envOidcParseResult = envOidcSchema.safeParse(process.env);
  if (!envOidcParseResult.success) {
    logger.fatal({ error: envOidcParseResult.error }, "An error has occurred when trying to parse the environment");
    process.exit(1);
  }
  const env = envOidcParseResult.data;
  return {
    provider: env.OIDC_PROVIDER,
    issuer: env.OIDC_ISSUER,
    introspectionPath: env.OIDC_INTROSPECTION_PATH,
    clientId: env.OIDC_CLIENT_ID,
    clientSecret: env.OIDC_CLIENT_SECRET,
  };
};

export const oidcConfig = getOidcConfig();
