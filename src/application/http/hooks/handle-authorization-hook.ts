import type { OIDCUser } from "@domain/oidc/oidc-user.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { z } from "zod";
import { type FastifyDefaultErrorResponseSchema, buildFastifyDefaultErrorResponses } from "../controllers/api-utils.js";

declare module "fastify" {
  interface FastifyRequest {
    user: (LoggedUser & { oidcUser: OIDCUser }) | null;
  }
}

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
