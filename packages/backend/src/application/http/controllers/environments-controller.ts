import {
  environmentInfoSchema,
  getEnvironmentResponse,
  getEnvironmentsQueryParamsSchema,
  getEnvironmentsResponse,
  upsertEnvironmentInput,
  upsertEnvironmentResponse,
} from "@ou-ca/common/api/environment";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const environmentsController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { environmentService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Environment"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const environmentResult = await environmentService.findEnvironment(req.params.id, req.user);

      if (environmentResult.isErr()) {
        switch (environmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const environment = environmentResult.value;

      if (!environment) {
        return await reply.notFound();
      }

      const response = getEnvironmentResponse.parse(environment);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Environment"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const environmentInfoResult = Result.combine([
        await environmentService.getEntriesCountByEnvironment(`${req.params.id}`, req.user),
        await environmentService.isEnvironmentUsed(`${req.params.id}`, req.user),
      ]);

      if (environmentInfoResult.isErr()) {
        switch (environmentInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isEnvironmentUsed] = environmentInfoResult.value;

      const response = environmentInfoSchema.parse({
        canBeDeleted: !isEnvironmentUsed,
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
        tags: ["Environment"],
        querystring: getEnvironmentsQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await environmentService.findPaginatedEnvironments(req.user, req.query),
        await environmentService.getEnvironmentsCount(req.user, req.query.q),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getEnvironmentsResponse.parse({
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
        tags: ["Environment"],
        body: upsertEnvironmentInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const environmentResult = await environmentService.createEnvironment(req.body, req.user);

      if (environmentResult.isErr()) {
        switch (environmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      const response = upsertEnvironmentResponse.parse(environmentResult.value);
      return await reply.send(response);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Environment"],
        params: idParamAsNumberSchema,
        body: upsertEnvironmentInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const environmentResult = await environmentService.updateEnvironment(req.params.id, req.body, req.user);

      if (environmentResult.isErr()) {
        switch (environmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      const response = upsertEnvironmentResponse.parse(environmentResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Environment"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedEnvironmentResult = await environmentService.deleteEnvironment(req.params.id, req.user);

      if (deletedEnvironmentResult.isErr()) {
        switch (deletedEnvironmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedEnvironment = deletedEnvironmentResult.value;

      if (!deletedEnvironment) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedEnvironment.id });
    },
  );

  done();
};
