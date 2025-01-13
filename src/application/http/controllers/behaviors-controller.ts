import { behaviorInfoSchema, getBehaviorsQueryParamsSchema, upsertBehaviorInput } from "@ou-ca/common/api/behavior.js";
import { behaviorSchema } from "@ou-ca/common/api/entities/behavior.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";

export const behaviorsController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { behaviorService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Behavior"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: behaviorSchema,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const behaviorResult = await behaviorService.findBehavior(req.params.id, req.user);

      if (behaviorResult.isErr()) {
        switch (behaviorResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const behavior = behaviorResult.value;

      if (!behavior) {
        return await reply.notFound();
      }

      return await reply.send(behavior);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Behavior"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: behaviorInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const behaviorInfoResult = Result.combine([
        await behaviorService.getEntriesCountByBehavior(`${req.params.id}`, req.user),
        await behaviorService.isBehaviorUsed(`${req.params.id}`, req.user),
      ]);

      if (behaviorInfoResult.isErr()) {
        switch (behaviorInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isBehaviorUsed] = behaviorInfoResult.value;

      return await reply.send({
        canBeDeleted: !isBehaviorUsed,
        ownEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Behavior"],
        querystring: getBehaviorsQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getPaginatedResponseSchema(behaviorSchema),
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await behaviorService.findPaginatedBehaviors(req.user, req.query),
        await behaviorService.getBehaviorsCount(req.user, req.query.q),
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
        tags: ["Behavior"],
        body: upsertBehaviorInput,
        response: withAuthenticationErrorResponses({
          200: behaviorSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const behaviorResult = await behaviorService.createBehavior(req.body, req.user);

      if (behaviorResult.isErr()) {
        switch (behaviorResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(behaviorResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Behavior"],
        params: idParamAsNumberSchema,
        body: upsertBehaviorInput,
        response: withAuthenticationErrorResponses({
          200: behaviorSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const behaviorResult = await behaviorService.updateBehavior(req.params.id, req.body, req.user);

      if (behaviorResult.isErr()) {
        switch (behaviorResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(behaviorResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Behavior"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedBehaviorResult = await behaviorService.deleteBehavior(req.params.id, req.user);

      if (deletedBehaviorResult.isErr()) {
        switch (deletedBehaviorResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedBehavior = deletedBehaviorResult.value;

      if (!deletedBehavior) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedBehavior.id });
    },
  );

  done();
};
