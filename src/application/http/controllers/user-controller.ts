import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { getAccessToken } from "./access-token-utils.js";
import { buildFastifyDefaultErrorResponses } from "./api-utils.js";

export const userController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { userService, oidcService } = services;

  fastify.post(
    "/create",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["User"],
        response: withAuthenticationErrorResponses({
          201: z.object({
            id: z.string(),
          }),
          ...buildFastifyDefaultErrorResponses([401, 403, 500]),
        }),
      },
    },
    async (req, reply) => {
      const accessTokenResult = getAccessToken(req);

      if (accessTokenResult.isErr()) {
        switch (accessTokenResult.error) {
          case "headerNotFound":
            return await reply.unauthorized("Authorization header is missing.");
          case "headerInvalidFormat":
            return await reply.unauthorized("Authorization header is invalid.");
        }
      }

      // Validate token
      const introspectionResultResult = await oidcService.introspectAccessTokenCached(accessTokenResult.value);

      if (introspectionResultResult.isErr()) {
        return await reply.internalServerError();
      }

      const introspectionResult = introspectionResultResult.value;

      if (!introspectionResult.active) {
        return await reply.unauthorized("Access token is not active.");
      }

      // Only user with active roles can create account
      const role = oidcService.getHighestRoleFromLoggedUser(introspectionResult.user);
      if (!role) {
        return await reply.forbidden();
      }

      const { id } = await userService.createUser({
        extProvider: introspectionResult.user.oidcProvider,
        extProviderUserId: introspectionResult.user.sub,
      });
      await reply.status(201).send({ id });
    },
  );

  done();
};
