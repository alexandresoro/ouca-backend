import {
  behaviorInfoSchema,
  getBehaviorResponse,
  getBehaviorsQueryParamsSchema,
  getBehaviorsResponse,
  upsertBehaviorInput,
  upsertBehaviorResponse,
} from "@ou-ca/common/api/behavior";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const behaviorResult = await behaviorService.findBehavior(req.params.id, req.user);

      if (behaviorResult.isErr()) {
        switch (behaviorResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const behavior = behaviorResult.value;

      if (!behavior) {
        return await reply.status(404).send();
      }

      const response = getBehaviorResponse.parse(behavior);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Behavior"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isBehaviorUsed] = behaviorInfoResult.value;

      const response = behaviorInfoSchema.parse({
        canBeDeleted: !isBehaviorUsed,
        ownEntriesCount,
      });

      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Behavior"],
        querystring: getBehaviorsQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getBehaviorsResponse.parse({
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
        tags: ["Behavior"],
        body: upsertBehaviorInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const behaviorResult = await behaviorService.createBehavior(req.body, req.user);

      if (behaviorResult.isErr()) {
        switch (behaviorResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertBehaviorResponse.parse(behaviorResult.value);
      return await reply.send(response);
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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const behaviorResult = await behaviorService.updateBehavior(req.params.id, req.body, req.user);

      if (behaviorResult.isErr()) {
        switch (behaviorResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertBehaviorResponse.parse(behaviorResult.value);
      return await reply.send(response);
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
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedBehavior = deletedBehaviorResult.value;

      if (!deletedBehavior) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedBehavior.id });
    },
  );

  done();
};
