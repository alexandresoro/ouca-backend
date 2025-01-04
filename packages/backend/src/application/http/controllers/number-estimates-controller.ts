import {
  getNumberEstimateResponse,
  getNumberEstimatesQueryParamsSchema,
  getNumberEstimatesResponse,
  numberEstimateInfoSchema,
  upsertNumberEstimateInput,
  upsertNumberEstimateResponse,
} from "@ou-ca/common/api/number-estimate";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const numberEstimateResult = await numberEstimateService.findNumberEstimate(req.params.id, req.user);

      if (numberEstimateResult.isErr()) {
        switch (numberEstimateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const numberEstimate = numberEstimateResult.value;

      if (!numberEstimate) {
        return await reply.status(404).send();
      }

      const response = getNumberEstimateResponse.parse(numberEstimate);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Quantity"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isNumberEstimateUsed] = numberEstimateInfoResult.value;

      const response = numberEstimateInfoSchema.parse({
        canBeDeleted: !isNumberEstimateUsed,
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
        tags: ["Quantity"],
        querystring: getNumberEstimatesQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getNumberEstimatesResponse.parse({
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
        tags: ["Quantity"],
        body: upsertNumberEstimateInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const numberEstimateCreateResult = await numberEstimateService.createNumberEstimate(req.body, req.user);

      if (numberEstimateCreateResult.isErr()) {
        switch (numberEstimateCreateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertNumberEstimateResponse.parse(numberEstimateCreateResult.value);
      return await reply.send(response);
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
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertNumberEstimateResponse.parse(numberEstimateUpdateResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Quantity"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const deletedNumberEstimateResult = await numberEstimateService.deleteNumberEstimate(req.params.id, req.user);

      if (deletedNumberEstimateResult.isErr()) {
        switch (deletedNumberEstimateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedNumberEstimate = deletedNumberEstimateResult.value;

      if (!deletedNumberEstimate) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedNumberEstimate.id });
    },
  );

  done();
};
