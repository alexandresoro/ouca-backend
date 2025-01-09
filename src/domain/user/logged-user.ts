import type { Permissions } from "./permissions.js";

export type LoggedUser = {
  id: string;
  permissions: Permissions;
};
