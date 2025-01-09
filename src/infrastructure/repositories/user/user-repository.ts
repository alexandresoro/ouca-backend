import { type User, userSchema } from "@domain/user/user.js";
import { redis } from "@infrastructure/ioredis/redis.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { logger } from "../../../utils/logger.js";

const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX = "externalUserInternalUserMapping";
const EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_DURATION = 600; // 10mns

const getCachedMappedUser = async ({
  externalProviderName,
  externalUserId,
}: {
  externalProviderName: string;
  externalUserId: string;
}): Promise<User | null> => {
  // Try first to retrieve from cache to avoid querying the DB if possible
  const userCacheKey = `${EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX}:${externalProviderName}:${externalUserId}`;

  const cachedUserStr = await redis.get(userCacheKey);

  return cachedUserStr ? (JSON.parse(cachedUserStr) as User) : null;
};

const storeMappedUserToCache = async (user: User): Promise<void> => {
  const userCacheKey = `${EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_PREFIX}:${user.extProviderName}:${user.extProviderId}`;

  await redis
    .set(userCacheKey, JSON.stringify(user), "EX", EXTERNAL_USER_INTERNAL_USER_MAPPING_CACHE_DURATION)
    .catch(() => {
      logger.warn(
        {
          user,
        },
        "Storing internal user mapping has failed.",
      );
    });
};

const findUserByExternalIdFromStorage = async ({
  externalProviderName,
  externalProviderId,
}: { externalProviderName: string; externalProviderId: string }): Promise<User | null> => {
  const userResult = await kysely
    .selectFrom("user")
    .selectAll()
    .where("extProviderName", "=", externalProviderName)
    .where("extProviderId", "=", externalProviderId)
    .executeTakeFirst();

  return userResult ? userSchema.parse(userResult) : null;
};

const getUserInfoById = async (userId: string): Promise<User | null> => {
  const userResult = await kysely.selectFrom("user").selectAll().where("id", "=", userId).executeTakeFirst();

  return userResult ? userSchema.parse(userResult) : null;
};

const findUserIdByExternalIdWithCache = async ({
  externalProviderName,
  externalUserId,
}: { externalProviderName: string; externalUserId: string }): Promise<string | null> => {
  // Try first to retrieve from cache to avoid querying the DB if possible
  const cachedUser = await getCachedMappedUser({ externalProviderName, externalUserId });

  if (cachedUser) {
    // Use the cached structure
    return cachedUser.id;
  }

  const user = await findUserByExternalIdFromStorage({ externalProviderName, externalProviderId: externalUserId });

  // Store in cache the result if it exists to avoid calling the database for every request
  if (user) {
    await storeMappedUserToCache(user);
  }

  return user?.id ?? null;
};

const findUserByExternalId = findUserByExternalIdFromStorage;

const updateUserSettings = async (id: string, settings: User["settings"]): Promise<User> => {
  const updatedUser = await kysely
    .updateTable("user")
    .set("settings", settings != null ? JSON.stringify(settings) : null)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return userSchema.parse(updatedUser);
};

const createUser = async ({
  extProviderName,
  extProviderId,
}: {
  extProviderName: string;
  extProviderId: string;
}): Promise<User> => {
  const createdUser = await kysely
    .insertInto("user")
    .values({
      extProviderId,
      extProviderName,
      settings: null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return userSchema.parse(createdUser);
};

export const userRepository = {
  getUserInfoById,
  findUserIdByExternalIdWithCache,
  findUserByExternalId,
  updateUserSettings,
  createUser,
};
