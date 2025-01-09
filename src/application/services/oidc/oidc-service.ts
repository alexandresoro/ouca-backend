import type { OIDCIntrospectionResult } from "@domain/oidc/oidc-introspection.js";
import type { OIDCUser } from "@domain/oidc/oidc-user.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import { type Permissions, mergePermissions } from "@domain/user/permissions.js";
import { type UserRole, getPermissionsFromRole, userRoles } from "@domain/user/user-role.js";
import type { User } from "@domain/user/user.js";
import {
  getIntrospectionResultFromCache,
  introspectAccessToken as introspectAccessTokenRepository,
  storeIntrospectionResultInCache,
} from "@infrastructure/oidc/oidc-introspect-access-token.js";
import { type Result, err, ok } from "neverthrow";
import type { UserService } from "../user/user-service.js";

type OidcServiceDependencies = {
  userService: UserService;
};

export const buildOidcService = ({ userService }: OidcServiceDependencies) => {
  /**
   * Compared to the more generic `findLoggedUserFromProvider` this function
   * is more suitable to only find the user id which is expected to remain constant
   * and not change over time for a given external user id/provider.
   * This method leverages a cache to avoid querying the database for every request and
   * so it is preferred to use this method over `findLoggedUserFromProvider` when only the user id is needed.
   */
  const findLoggedUserIdFromProvider = async (
    externalProviderName: string,
    externalUserId: string,
  ): Promise<Result<string, "internalUserNotFound">> => {
    const matchingUserId = await userService.findUserIdByExternalIdWithCache(externalProviderName, externalUserId);

    if (!matchingUserId) {
      return err("internalUserNotFound");
    }

    return ok(matchingUserId);
  };

  const findLoggedUserFromProvider = async (
    externalProviderName: string,
    externalUserId: string,
  ): Promise<Result<User, "internalUserNotFound">> => {
    const matchingUser = await userService.findUserByExternalId(externalProviderName, externalUserId);

    if (!matchingUser) {
      return err("internalUserNotFound");
    }

    return ok(matchingUser);
  };

  const introspectAccessToken = async (
    accessToken: string,
  ): Promise<Result<OIDCIntrospectionResult, "introspectionError">> => {
    const introspectionResult = (await introspectAccessTokenRepository(accessToken)).mapErr(
      () => "introspectionError" as const,
    );

    if (introspectionResult.isErr()) {
      return err("introspectionError");
    }

    // Regardless of the outcome, store the result in cache
    await storeIntrospectionResultInCache(introspectionResult.value, accessToken);

    return introspectionResult;
  };

  const introspectAccessTokenCached = async (
    accessToken: string,
  ): Promise<Result<OIDCIntrospectionResult, "introspectionError">> => {
    // Check if introspection result exists in cache
    const cachedKeyResult = await getIntrospectionResultFromCache(accessToken);

    if (cachedKeyResult.isErr()) {
      return err("introspectionError");
    }

    const cachedKey = cachedKeyResult.value;
    if (cachedKey != null) {
      // Return result from cache
      return ok(cachedKey);
    }

    // Introspect token if not present in cache
    const introspectionResult = await introspectAccessToken(accessToken);

    if (introspectionResult.isErr()) {
      return err("introspectionError");
    }

    // Regardless of the outcome, store the result in cache
    await storeIntrospectionResultInCache(introspectionResult.value, accessToken);

    return introspectionResult;
  };

  const getHighestRoleFromLoggedUser = (oidcUser: OIDCUser): UserRole | null => {
    return (
      userRoles.find((existingRole) => {
        return oidcUser.roles.includes(existingRole);
      }) ?? null
    );
  };

  const getPermissionsFromUser = (oidcUser: OIDCUser): Permissions => {
    return mergePermissions(oidcUser.roles.map(getPermissionsFromRole));
  };

  const getMatchingLoggedUser = async (
    oidcUser: OIDCUser,
  ): Promise<Result<LoggedUser, "internalUserNotFound" | "userHasNoRole">> => {
    // Validate role from token
    const roleFromToken = getHighestRoleFromLoggedUser(oidcUser);

    if (!roleFromToken) {
      return err("userHasNoRole");
    }

    // Validate internal matching user
    const internalUserIdResult = await findLoggedUserIdFromProvider(oidcUser.oidcProvider, oidcUser.sub);

    if (internalUserIdResult.isErr()) {
      return err(internalUserIdResult.error);
    }

    const internalUserId = internalUserIdResult.value;

    return ok({
      id: internalUserId,
      role: roleFromToken,
      permissions: getPermissionsFromUser(oidcUser),
    });
  };

  return {
    findLoggedUserIdFromProvider,
    findLoggedUserFromProvider,
    introspectAccessTokenCached,
    getHighestRoleFromLoggedUser,
    getMatchingLoggedUser,
  };
};

export type OidcService = ReturnType<typeof buildOidcService>;
