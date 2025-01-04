import {
  getSpeciesPaginatedResponse,
  getSpeciesQueryParamsSchema,
  getSpeciesResponse,
  speciesInfoQueryParamsSchema,
  speciesInfoSchema,
  upsertSpeciesInput,
  upsertSpeciesResponse,
} from "@ou-ca/common/api/species";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const speciesResult = await speciesService.findSpecies(req.params.id, req.user);

      if (speciesResult.isErr()) {
        switch (speciesResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const species = speciesResult.value;

      if (!species) {
        return await reply.status(404).send();
      }

      const response = getSpeciesResponse.parse(species);
      return await reply.send(response);
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
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
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
              return await reply.status(403).send();
          }
        }

        totalEntriesCount = totalEntriesCountResult.value;
      }

      const [ownEntriesCount, isSpeciesUsed] = speciesInfoResult.value;

      const response = speciesInfoSchema.parse({
        canBeDeleted: !isSpeciesUsed,
        ownEntriesCount,
        totalEntriesCount,
      });

      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        querystring: getSpeciesQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getSpeciesPaginatedResponse.parse({
        data,
        meta: getPaginationMetadata(count, req.query),
      });

      return await reply.send(response);
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        body: upsertSpeciesInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const speciesResult = await speciesService.createSpecies(req.body, req.user);

      if (speciesResult.isErr()) {
        switch (speciesResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertSpeciesResponse.parse(speciesResult.value);
      return await reply.send(response);
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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const speciesResult = await speciesService.updateSpecies(req.params.id, req.body, req.user);

      if (speciesResult.isErr()) {
        switch (speciesResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertSpeciesResponse.parse(speciesResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const deletedSpeciesResult = await speciesService.deleteSpecies(req.params.id, req.user);

      if (deletedSpeciesResult.isErr()) {
        switch (deletedSpeciesResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedSpecies = deletedSpeciesResult.value;

      if (!deletedSpecies) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedSpecies.id });
    },
  );

  done();
};
