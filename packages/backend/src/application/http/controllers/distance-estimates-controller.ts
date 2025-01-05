import {
  distanceEstimateInfoSchema,
  getDistanceEstimateResponse,
  getDistanceEstimatesQueryParamsSchema,
  getDistanceEstimatesResponse,
  upsertDistanceEstimateInput,
  upsertDistanceEstimateResponse,
} from "@ou-ca/common/api/distance-estimate";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const distanceEstimatesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { distanceEstimateService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Distance"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const distanceEstimateResult = await distanceEstimateService.findDistanceEstimate(req.params.id, req.user);

      if (distanceEstimateResult.isErr()) {
        switch (distanceEstimateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const distanceEstimate = distanceEstimateResult.value;

      if (!distanceEstimate) {
        return await reply.status(404).send();
      }

      const response = getDistanceEstimateResponse.parse(distanceEstimate);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Distance"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const distanceEstimateInfoResult = Result.combine([
        await distanceEstimateService.getEntriesCountByDistanceEstimate(`${req.params.id}`, req.user),
        await distanceEstimateService.isDistanceEstimateUsed(`${req.params.id}`, req.user),
      ]);

      if (distanceEstimateInfoResult.isErr()) {
        switch (distanceEstimateInfoResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isDistanceEstimateUsed] = distanceEstimateInfoResult.value;

      const response = distanceEstimateInfoSchema.parse({
        canBeDeleted: !isDistanceEstimateUsed,
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
        tags: ["Distance"],
        querystring: getDistanceEstimatesQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await distanceEstimateService.findPaginatedDistanceEstimates(req.user, req.query),
        await distanceEstimateService.getDistanceEstimatesCount(req.user, req.query.q),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getDistanceEstimatesResponse.parse({
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
        tags: ["Distance"],
        body: upsertDistanceEstimateInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const distanceEstimateCreateResult = await distanceEstimateService.createDistanceEstimate(req.body, req.user);

      if (distanceEstimateCreateResult.isErr()) {
        switch (distanceEstimateCreateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertDistanceEstimateResponse.parse(distanceEstimateCreateResult.value);
      return await reply.send(response);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Distance"],
        params: idParamAsNumberSchema,
        body: upsertDistanceEstimateInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const distanceEstimateUpdateResult = await distanceEstimateService.updateDistanceEstimate(
        req.params.id,
        req.body,
        req.user,
      );

      if (distanceEstimateUpdateResult.isErr()) {
        switch (distanceEstimateUpdateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertDistanceEstimateResponse.parse(distanceEstimateUpdateResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Distance"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedDistanceEstimateResult = await distanceEstimateService.deleteDistanceEstimate(
        req.params.id,
        req.user,
      );

      if (deletedDistanceEstimateResult.isErr()) {
        switch (deletedDistanceEstimateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedDistanceEstimate = deletedDistanceEstimateResult.value;

      if (!deletedDistanceEstimate) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedDistanceEstimate.id });
    },
  );

  done();
};
