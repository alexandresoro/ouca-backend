import { numberEstimateSchema } from "@ou-ca/common/api/entities/number-estimate.js";
import {
  getNumberEstimatesQueryParamsSchema,
  numberEstimateInfoSchema,
  upsertNumberEstimateInput,
} from "@ou-ca/common/api/number-estimate.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";

export const numberEstimatesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { numberEstimateService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Quantity"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: numberEstimateSchema,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const numberEstimateResult = await numberEstimateService.findNumberEstimate(req.params.id, req.user);

      if (numberEstimateResult.isErr()) {
        switch (numberEstimateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const numberEstimate = numberEstimateResult.value;

      if (!numberEstimate) {
        return await reply.notFound();
      }

      return await reply.send(numberEstimate);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Quantity"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: numberEstimateInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const numberEstimateInfoResult = Result.combine([
        await numberEstimateService.getEntriesCountByNumberEstimate(`${req.params.id}`, req.user),
        await numberEstimateService.isNumberEstimateUsed(`${req.params.id}`, req.user),
      ]);

      if (numberEstimateInfoResult.isErr()) {
        switch (numberEstimateInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isNumberEstimateUsed] = numberEstimateInfoResult.value;

      return await reply.send({
        canBeDeleted: !isNumberEstimateUsed,
        ownEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Quantity"],
        querystring: getNumberEstimatesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getPaginatedResponseSchema(numberEstimateSchema),
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await numberEstimateService.findPaginatesNumberEstimates(req.user, req.query),
        await numberEstimateService.getNumberEstimatesCount(req.user, req.query.q),
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
        tags: ["Quantity"],
        body: upsertNumberEstimateInput,
        response: withAuthenticationErrorResponses({
          200: numberEstimateSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const numberEstimateCreateResult = await numberEstimateService.createNumberEstimate(req.body, req.user);

      if (numberEstimateCreateResult.isErr()) {
        switch (numberEstimateCreateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(numberEstimateCreateResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Quantity"],
        params: idParamAsNumberSchema,
        body: upsertNumberEstimateInput,
        response: withAuthenticationErrorResponses({
          200: numberEstimateSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const numberEstimateUpdateResult = await numberEstimateService.updateNumberEstimate(
        req.params.id,
        req.body,
        req.user,
      );

      if (numberEstimateUpdateResult.isErr()) {
        switch (numberEstimateUpdateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(numberEstimateUpdateResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Quantity"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedNumberEstimateResult = await numberEstimateService.deleteNumberEstimate(req.params.id, req.user);

      if (deletedNumberEstimateResult.isErr()) {
        switch (deletedNumberEstimateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedNumberEstimate = deletedNumberEstimateResult.value;

      if (!deletedNumberEstimate) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedNumberEstimate.id });
    },
  );

  done();
};
