import type { OIDCUser } from "./oidc-user.js";

export type OIDCIntrospectionResult =
  | {
      active: false;
    }
  | {
      active: true;
      user: OIDCUser;
    };
