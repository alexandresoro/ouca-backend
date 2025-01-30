import type { OIDCUser } from "@domain/oidc/oidc-user.js";
import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { ServicesVariables } from "./services.js";

export type OidcAuthVariables = ServicesVariables & {
  oidcUser: OIDCUser;
};

export const oidcAuth = createMiddleware<{
  // biome-ignore lint/style/useNamingConvention: <explanation>
  Variables: OidcAuthVariables;
}>(async (c, next) => {
  const bearer = bearerAuth({
    verifyToken: async (token) => {
      const introspectTokenResult = await c.var.services.oidcService.introspectAccessTokenCached(token);

      if (introspectTokenResult.isErr()) {
        throw new HTTPException(500);
      }

      if (!introspectTokenResult.value.active) {
        return false;
      }

      c.set("oidcUser", introspectTokenResult.value.user);
      return true;
    },
    noAuthenticationHeaderMessage: "Authorization header is missing.",
    invalidAuthenticationHeaderMessage: "Authorization header is invalid.",
    invalidTokenMessage: "Access token is not active.",
  });

  return bearer(c, next);
});
