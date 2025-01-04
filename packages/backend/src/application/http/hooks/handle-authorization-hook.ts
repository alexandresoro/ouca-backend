import type { OIDCUser } from "@domain/oidc/oidc-user.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { getAccessToken } from "../controllers/access-token-utils.js";

declare module "fastify" {
  interface FastifyRequest {
    user: (LoggedUser & { oidcUser: OIDCUser }) | null;
  }
}

export const handleAuthorizationHook = async (
  request: FastifyRequest,
  reply: FastifyReply,
  services: Services,
): Promise<void> => {
  const { oidcService } = services;

  const accessTokenResult = getAccessToken(request);

  if (accessTokenResult.isErr()) {
    switch (accessTokenResult.error) {
      case "headerNotFound":
        return await reply.status(401).send("Authorization header is missing.");
      case "headerInvalidFormat":
        return await reply.status(401).send("Authorization header is invalid.");
    }
  }

  const accessToken = accessTokenResult.value;

  const introspectTokenResult = await oidcService.introspectAccessTokenCached(accessToken);

  if (introspectTokenResult.isErr()) {
    return await reply.status(500).send();
  }

  const introspectionResult = introspectTokenResult.value;

  // Introspect token if not present in cache

  if (introspectTokenResult.isErr()) {
    return await reply.status(500).send();
  }

  if (!introspectionResult.active) {
    return await reply.status(401).send("Access token is not active.");
  }

  const matchingLoggedUserResult = await oidcService.getMatchingLoggedUser(introspectionResult.user);
  if (matchingLoggedUserResult.isErr()) {
    switch (matchingLoggedUserResult.error) {
      case "internalUserNotFound":
        return await reply.status(404).send("Application user not found");
      case "userHasNoRole":
        return await reply.status(403).send("User has no role");
    }
  }

  request.user = { ...matchingLoggedUserResult.value, oidcUser: introspectionResult.user };
};

export const withAuthenticationErrorResponses = <T extends Record<number, z.ZodTypeAny>>(
  responses: T,
): Omit<T, 401 | 403 | 404 | 500> & {
  401?: z.ZodString | z.ZodUnion<[T[401], z.ZodString]>;
  403?: z.ZodString | z.ZodUnion<[T[403], z.ZodString]>;
  404?: z.ZodString | z.ZodUnion<[T[404], z.ZodString]>;
  500?: z.ZodNull | z.ZodUnion<[T[500], z.ZodNull]>;
} => {
  const { 401: response401, 403: response403, 404: response404, 500: response500, ...restResponses } = responses;

  return {
    ...restResponses,
    // TODO: Don't enforce the validation for this while not all schemas are updated to declare their use of these responses
    // Otherwise we will break the validation for these cases if they use it but don't declare it
    ...(response401 != null ? { 401: response401 != null ? z.union([response401, z.string()]) : z.string() } : {}),
    ...(response403 != null ? { 403: response403 != null ? z.union([response403, z.string()]) : z.string() } : {}),
    ...(response404 != null ? { 404: response404 != null ? z.union([response404, z.string()]) : z.string() } : {}),
    ...(response500 != null ? { 500: response500 != null ? z.union([response500, z.null()]) : z.null() } : {}),
  };
};
