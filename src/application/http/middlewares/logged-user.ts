import type { LoggedUser } from "@domain/user/logged-user.js";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { OidcAuthVariables } from "./oidc-auth.js";

export type LoggedUserVariables = OidcAuthVariables & {
  user: LoggedUser;
};

export const loggedUser = createMiddleware<{
  // biome-ignore lint/style/useNamingConvention: <explanation>
  Variables: LoggedUserVariables;
}>(async (c, next) => {
  const matchingLoggedUserResult = await c.var.services.oidcService.getMatchingLoggedUser(c.var.oidcUser);
  if (matchingLoggedUserResult.isErr()) {
    switch (matchingLoggedUserResult.error) {
      case "internalUserNotFound": {
        throw new HTTPException(403, { message: "Application user not found" });
      }
      case "userHasNoRole": {
        throw new HTTPException(403, { message: "User has no role" });
      }
    }
  }

  c.set("user", matchingLoggedUserResult.value);
  await next();
});
