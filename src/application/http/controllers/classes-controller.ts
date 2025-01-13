import {
  getClassResponse,
  getClassesQueryParamsSchema,
  getClassesResponse,
  speciesClassInfoSchema,
  upsertClassInput,
  upsertClassResponse,
} from "@ou-ca/common/api/species-class.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./common/pagination.js";

export const classesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { classService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: getClassResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const speciesClassResult = await classService.findSpeciesClass(req.params.id, req.user);

      if (speciesClassResult.isErr()) {
        switch (speciesClassResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const speciesClass = speciesClassResult.value;

      if (!speciesClass) {
        return await reply.notFound();
      }

      return await reply.send(speciesClass);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: speciesClassInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const speciesClassInfoResult = Result.combine([
        await classService.getEntriesCountBySpeciesClass(`${req.params.id}`, req.user),
        await classService.isSpeciesClassUsed(`${req.params.id}`, req.user),
        await classService.getSpeciesCountBySpeciesClass(`${req.params.id}`, req.user),
      ]);

      if (speciesClassInfoResult.isErr()) {
        switch (speciesClassInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isSpeciesClassUsed, speciesCount] = speciesClassInfoResult.value;

      return await reply.send({
        canBeDeleted: !isSpeciesClassUsed,
        ownEntriesCount,
        speciesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        querystring: getClassesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getClassesResponse,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await classService.findPaginatedSpeciesClasses(req.user, req.query),
        await classService.getSpeciesClassesCount(req.user, req.query.q),
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
        body: upsertClassInput,
        response: withAuthenticationErrorResponses({
          200: upsertClassResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const speciesClassCreateResult = await classService.createSpeciesClass(req.body, req.user);

      if (speciesClassCreateResult.isErr()) {
        switch (speciesClassCreateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(speciesClassCreateResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Species"],
        params: idParamAsNumberSchema,
        body: upsertClassInput,
        response: withAuthenticationErrorResponses({
          200: upsertClassResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const speciesClassUpdateResult = await classService.updateSpeciesClass(req.params.id, req.body, req.user);

      if (speciesClassUpdateResult.isErr()) {
        switch (speciesClassUpdateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(speciesClassUpdateResult.value);
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
      const deletedSpeciesClassResult = await classService.deleteSpeciesClass(req.params.id, req.user);

      if (deletedSpeciesClassResult.isErr()) {
        switch (deletedSpeciesClassResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedSpeciesClass = deletedSpeciesClassResult.value;

      if (!deletedSpeciesClass) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedSpeciesClass.id });
    },
  );

  done();
};
