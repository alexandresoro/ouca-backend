import type { User } from "@domain/user/user.js";

export type UserRepository = {
  getUserInfoById: (userId: string) => Promise<User | null>;
  /**
   * Compared to the more generic `findUserByExternalId` this function
   * is more suitable to only find the user id which is expected to remain constant
   * and not change over time for a given external user id/provider.
   * This method leverages a cache to avoid querying the database for every request and
   * so it is preferred to use this method over `findUserByExternalId` when only the user id is needed.
   */
  findUserIdByExternalIdWithCache: ({
    externalProviderName,
    externalUserId,
  }: { externalProviderName: string; externalUserId: string }) => Promise<string | null>;
  findUserByExternalId: ({
    externalProviderName,
    externalProviderId,
  }: { externalProviderName: string; externalProviderId: string }) => Promise<User | null>;
  updateUserSettings: (id: string, settings: User["settings"]) => Promise<User>;
  createUser: (create: {
    extProviderName: string;
    extProviderId: string;
  }) => Promise<User>;
};
