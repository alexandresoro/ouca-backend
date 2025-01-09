import type { CreateUserInput, User } from "@domain/user/user.js";
import type { UserRepository } from "@interfaces/user-repository-interface.js";
import {} from "neverthrow";
import { logger } from "../../../utils/logger.js";

type UserServiceDependencies = {
  userRepository: UserRepository;
};

export const buildUserService = ({ userRepository }: UserServiceDependencies) => {
  const getUser = async (userId: string): Promise<User | null> => userRepository.getUserInfoById(userId);

  /**
   * Compared to the more generic `findUserByExternalId` this function
   * is more suitable to only find the user id which is expected to remain constant
   * and not change over time for a given external user id/provider.
   * This method leverages a cache to avoid querying the database for every request and
   * so it is preferred to use this method over `findUserByExternalId` when only the user id is needed.
   */
  const findUserIdByExternalIdWithCache = async (
    externalProviderName: string,
    externalUserId: string,
  ): Promise<string | null> => userRepository.findUserIdByExternalIdWithCache({ externalUserId, externalProviderName });

  const findUserByExternalId = async (externalProviderName: string, externalProviderId: string): Promise<User | null> =>
    userRepository.findUserByExternalId({ externalProviderId, externalProviderName });

  const updateSettings = async (id: string, settings: NonNullable<User["settings"]>): Promise<User> => {
    logger.trace(
      {
        userId: id,
        settings,
      },
      `Saving user settings of User=${id}`,
    );

    return userRepository.updateUserSettings(id, settings);
  };

  const createUser = async ({ extProvider, extProviderUserId }: CreateUserInput): Promise<User> =>
    userRepository.createUser({
      extProviderName: extProvider,
      extProviderId: extProviderUserId,
    });

  return {
    getUser,
    findUserIdByExternalIdWithCache,
    findUserByExternalId,
    updateSettings,
    createUser,
  };
};

export type UserService = ReturnType<typeof buildUserService>;
