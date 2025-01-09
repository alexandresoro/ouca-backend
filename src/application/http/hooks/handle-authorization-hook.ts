import type { OIDCUser } from "@domain/oidc/oidc-user.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import type { Services } from "../../services/services.js";
import { getAccessToken } from "../controllers/access-token-utils.js";
import { type FastifyDefaultErrorResponseSchema, buildFastifyDefaultErrorResponses } from "../controllers/api-utils.js";

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
        return await reply.unauthorized("Authorization header is missing.");
      case "headerInvalidFormat":
        return await reply.unauthorized("Authorization header is invalid.");
    }
  }

  const accessToken = accessTokenResult.value;

  const introspectTokenResult = await oidcService.introspectAccessTokenCached(accessToken);

  if (introspectTokenResult.isErr()) {
    return await reply.internalServerError();
  }

  const introspectionResult = introspectTokenResult.value;

  // Introspect token if not present in cache

  if (introspectTokenResult.isErr()) {
    return await reply.internalServerError();
  }

  if (!introspectionResult.active) {
    return await reply.unauthorized("Access token is not active.");
  }

  const matchingLoggedUserResult = await oidcService.getMatchingLoggedUser(introspectionResult.user);
  if (matchingLoggedUserResult.isErr()) {
    switch (matchingLoggedUserResult.error) {
      case "internalUserNotFound":
        return await reply.notFound("Application user not found");
      case "userHasNoRole":
        return await reply.forbidden("User has no role");
    }
  }

  request.user = { ...matchingLoggedUserResult.value, oidcUser: introspectionResult.user };
};

export const withAuthenticationErrorResponses = <T extends Record<number, z.ZodTypeAny>>(
  responses: T,
): T & {
  401: FastifyDefaultErrorResponseSchema;
  403: FastifyDefaultErrorResponseSchema;
  404: FastifyDefaultErrorResponseSchema;
  500: FastifyDefaultErrorResponseSchema;
} => {
  const authenticationErrorResponses = buildFastifyDefaultErrorResponses([401, 403, 404, 500]);

  return {
    ...responses,
    ...authenticationErrorResponses,
  };
};
