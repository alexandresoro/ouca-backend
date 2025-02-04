import { createFactory } from "hono/factory";
import type { Services } from "../../services/services.js";
import type { EnvApiV1 } from "../context.js";
import { loggedUser } from "../middlewares/logged-user.js";
import { oidcAuth } from "../middlewares/oidc-auth.js";
import { injectServices } from "../middlewares/services.js";

export const buildApiV1Factory = (services: Services) => {
  return createFactory<EnvApiV1>({
    initApp: (app) => {
      app
        // Service injection
        .use(injectServices(services))
        // Authentication
        .use(oidcAuth)
        // Authorization
        .use(loggedUser);
    },
  });
};
