import { speciesSchema } from "@ou-ca/common/api/entities/species.js";
import {
  getSpeciesQueryParamsSchema,
  speciesInfoQueryParamsSchema,
  speciesInfoSchema,
  upsertSpeciesInput,
} from "@ou-ca/common/api/species.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";

export const speciesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { speciesService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: speciesSchema,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const speciesResult = await speciesService.findSpecies(req.params.id, req.user);

      if (speciesResult.isErr()) {
        switch (speciesResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const species = speciesResult.value;

      if (!species) {
        return await reply.notFound();
      }

      return await reply.send(species);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        querystring: speciesInfoQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: speciesInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const speciesInfoResult = Result.combine([
        await speciesService.getEntriesCountBySpecies(`${req.params.id}`, req.query, req.user),
        await speciesService.isSpeciesUsed(`${req.params.id}`, req.user),
      ]);

      if (speciesInfoResult.isErr()) {
        switch (speciesInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      let totalEntriesCount: number | undefined = undefined;
      if (req.user?.permissions.canViewAllEntries) {
        // TODO: this should be better handled in the service
        const totalEntriesCountResult = await speciesService.getEntriesCountBySpecies(
          `${req.params.id}`,
          req.query,
          req.user,
          true,
        );

        if (totalEntriesCountResult.isErr()) {
          switch (totalEntriesCountResult.error) {
            case "notAllowed":
              return await reply.forbidden();
          }
        }

        totalEntriesCount = totalEntriesCountResult.value;
      }

      const [ownEntriesCount, isSpeciesUsed] = speciesInfoResult.value;

      return await reply.send({
        canBeDeleted: !isSpeciesUsed,
        ownEntriesCount,
        totalEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
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
      const paginatedResults = Result.combine([
        await speciesService.findPaginatedSpecies(req.user, req.query),
        await speciesService.getSpeciesCount(req.user, req.query),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [data, count] = paginatedResults.value;

      return await reply.send({
        data,
        meta: getPaginationMetadata(count, req.query),
      });
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        body: upsertSpeciesInput,
        response: withAuthenticationErrorResponses({
          200: speciesSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const speciesResult = await speciesService.createSpecies(req.body, req.user);

      if (speciesResult.isErr()) {
        switch (speciesResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(speciesResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        body: upsertSpeciesInput,
        response: withAuthenticationErrorResponses({
          200: speciesSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const speciesResult = await speciesService.updateSpecies(req.params.id, req.body, req.user);

      if (speciesResult.isErr()) {
        switch (speciesResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(speciesResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedSpeciesResult = await speciesService.deleteSpecies(req.params.id, req.user);

      if (deletedSpeciesResult.isErr()) {
        switch (deletedSpeciesResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedSpecies = deletedSpeciesResult.value;

      if (!deletedSpecies) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedSpecies.id });
    },
  );

  done();
};
