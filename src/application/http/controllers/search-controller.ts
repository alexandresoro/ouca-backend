import { speciesSchema } from "@ou-ca/common/api/entities/species.js";
import { getSpeciesQueryParamsSchema } from "@ou-ca/common/api/species.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";

export const searchController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { speciesService } = services;

  fastify.get(
    "/species",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        querystring: getSpeciesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getPaginatedResponseSchema(speciesSchema),
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      if (req.query.fromAllUsers && !req.user?.permissions.canViewAllEntries) {
        return await reply.forbidden();
      }

      // If we don't want to see all users' species, we need to filter by ownerId
      const reshapedQueryParams = {
        ...req.query,
        ownerId: req.query.fromAllUsers ? undefined : req.user?.id,
      };

      const paginatedResults = Result.combine([
        await speciesService.findPaginatedSpecies(req.user, reshapedQueryParams),
        await speciesService.getSpeciesCount(req.user, reshapedQueryParams),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [speciesData, count] = paginatedResults.value;

      return await reply.send({
        data: speciesData,
        meta: getPaginationMetadata(count, req.query),
      });
    },
  );

  done();
};
