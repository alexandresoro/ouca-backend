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
        response: withAuthenticationErrorResponses({
          200: getDistanceEstimateResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const distanceEstimateResult = await distanceEstimateService.findDistanceEstimate(req.params.id, req.user);

      if (distanceEstimateResult.isErr()) {
        switch (distanceEstimateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const distanceEstimate = distanceEstimateResult.value;

      if (!distanceEstimate) {
        return await reply.notFound();
      }

      return await reply.send(distanceEstimate);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Distance"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: distanceEstimateInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
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
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isDistanceEstimateUsed] = distanceEstimateInfoResult.value;

      return await reply.send({
        canBeDeleted: !isDistanceEstimateUsed,
        ownEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Distance"],
        querystring: getDistanceEstimatesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getDistanceEstimatesResponse,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
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
        tags: ["Distance"],
        body: upsertDistanceEstimateInput,
        response: withAuthenticationErrorResponses({
          200: upsertDistanceEstimateResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const distanceEstimateCreateResult = await distanceEstimateService.createDistanceEstimate(req.body, req.user);

      if (distanceEstimateCreateResult.isErr()) {
        switch (distanceEstimateCreateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(distanceEstimateCreateResult.value);
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
        response: withAuthenticationErrorResponses({
          200: upsertDistanceEstimateResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
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
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(distanceEstimateUpdateResult.value);
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
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedDistanceEstimate = deletedDistanceEstimateResult.value;

      if (!deletedDistanceEstimate) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedDistanceEstimate.id });
    },
  );

  done();
};
