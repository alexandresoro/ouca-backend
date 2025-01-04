import { getAltitudeQueryParamsSchema, getAltitudeResponse } from "@ou-ca/common/api/altitude";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";

export const altitudeController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { altitudeService } = services;

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        querystring: getAltitudeQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const altitudeResult = await altitudeService.getAltitude(req.query);

      if (altitudeResult.isErr()) {
        switch (altitudeResult.error) {
          case "coordinatesNotSupported":
            return await reply.notFound();
          case "fetchError":
            return await reply.internalServerError();
          case "parseError":
            return await reply.internalServerError();
        }
      }

      const response = getAltitudeResponse.parse(altitudeResult.value);

      return await reply.send(response);
    },
  );

  done();
};
