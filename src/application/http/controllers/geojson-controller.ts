import { fastifyEtag } from "@fastify/etag";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";

export const geojsonController: FastifyPluginAsyncZod<{
  services: Services;
}> = async (fastify, { services }) => {
  const { geojsonService } = services;

  await fastify.register(fastifyEtag, {
    algorithm: "sha256",
  });

  fastify.get(
    "/localities.json",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        response: withAuthenticationErrorResponses({
          200: z.unknown(),
        }),
      },
    },
    async (req, reply) => {
      const geoJsonLocalitiesResult = await geojsonService.getLocalities(req.user);

      if (geoJsonLocalitiesResult.isErr()) {
        switch (geoJsonLocalitiesResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      return await reply
        .header("Content-Type", "application/json; charset=utf-8")
        .cacheControl("private")
        .cacheControl("max-age", 300)
        .send(geoJsonLocalitiesResult.value);
    },
  );
};
