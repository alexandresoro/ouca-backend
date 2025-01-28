import type { OIDCUser } from "@domain/oidc/oidc-user.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Services } from "../../../services/services.js";

// Context for routes with authentication
export type HonoApiV1Env = {
  // biome-ignore lint/style/useNamingConvention: <explanation>
  Variables: {
    user: LoggedUser & { oidcUser: OIDCUser };
    services: Services;
  };
};
