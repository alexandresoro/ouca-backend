import { sexSchema } from "@ou-ca/common/api/entities/sex.js";
import { getSexesQueryParamsSchema, sexInfoSchema, upsertSexInput } from "@ou-ca/common/api/sex.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";

export const sexesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { sexService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Sex"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: sexSchema,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const sexResult = await sexService.findSex(req.params.id, req.user);

      if (sexResult.isErr()) {
        switch (sexResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const sex = sexResult.value;

      if (!sex) {
        return await reply.notFound();
      }

      return await reply.send(sex);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Sex"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: sexInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const sexInfoResult = Result.combine([
        await sexService.getEntriesCountBySex(`${req.params.id}`, req.user),
        await sexService.isSexUsed(`${req.params.id}`, req.user),
      ]);

      if (sexInfoResult.isErr()) {
        switch (sexInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isSexUsed] = sexInfoResult.value;

      return await reply.send({
        canBeDeleted: !isSexUsed,
        ownEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Sex"],
        querystring: getSexesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getPaginatedResponseSchema(sexSchema),
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await sexService.findPaginatedSexes(req.user, req.query),
        await sexService.getSexesCount(req.user, req.query.q),
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
        tags: ["Sex"],
        body: upsertSexInput,
        response: withAuthenticationErrorResponses({
          200: sexSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const sexCreateResult = await sexService.createSex(req.body, req.user);

      if (sexCreateResult.isErr()) {
        switch (sexCreateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(sexCreateResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Sex"],
        params: idParamAsNumberSchema,
        body: upsertSexInput,
        response: withAuthenticationErrorResponses({
          200: sexSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const sexUpdateResult = await sexService.updateSex(req.params.id, req.body, req.user);

      if (sexUpdateResult.isErr()) {
        switch (sexUpdateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(sexUpdateResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Sex"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedSexResult = await sexService.deleteSex(req.params.id, req.user);

      if (deletedSexResult.isErr()) {
        switch (deletedSexResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedSex = deletedSexResult.value;

      if (!deletedSex) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedSex.id });
    },
  );

  done();
};
