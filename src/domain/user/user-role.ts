import { ADMIN_PERMISSIONS } from "@domain/user/role-permissions/admin.js";
import { CONTRIBUTOR_PERMISSIONS } from "@domain/user/role-permissions/contributor.js";
import { USER_PERMISSIONS } from "@domain/user/role-permissions/user.js";

export const userRoles = ["admin", "contributor", "user"] as const;
export type UserRole = (typeof userRoles)[number];

export const getPermissionsFromRole = (role: UserRole) => {
  switch (role) {
    case "admin":
      return ADMIN_PERMISSIONS;
    case "contributor":
      return CONTRIBUTOR_PERMISSIONS;
    case "user":
      return USER_PERMISSIONS;
  }
};
