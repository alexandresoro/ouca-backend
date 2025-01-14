import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses } from "./api-utils.js";

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
        querystring: z.object({
          latitude: z.coerce.number().min(-90).max(90),
          longitude: z.coerce.number().min(-180).max(180),
        }),
        response: withAuthenticationErrorResponses({
          200: z.object({
            altitude: z.number(),
          }),
          ...buildFastifyDefaultErrorResponses([404, 500]),
        }),
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

      return await reply.send(altitudeResult.value);
    },
  );

  done();
};
