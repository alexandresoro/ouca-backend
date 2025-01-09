import {
  deleteObserverResponse,
  getObserverResponse,
  getObserversQueryParamsSchema,
  getObserversResponse,
  observerInfoSchema,
  upsertObserverInput,
  upsertObserverResponse,
} from "@ou-ca/common/api/observer.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const observersController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { observerService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: getObserverResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const observerResult = await observerService.findObserver(req.params.id, req.user);

      if (observerResult.isErr()) {
        switch (observerResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const observer = observerResult.value;

      if (!observer) {
        return await reply.notFound();
      }

      return await reply.send(observer);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: observerInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const observerInfoResult = Result.combine([
        await observerService.getEntriesCountByObserver(`${req.params.id}`, req.user),
        await observerService.isObserverUsed(`${req.params.id}`, req.user),
      ]);

      if (observerInfoResult.isErr()) {
        switch (observerInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isObserverUsed] = observerInfoResult.value;

      return await reply.send({
        canBeDeleted: !isObserverUsed,
        ownEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        querystring: getObserversQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getObserversResponse,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await observerService.findPaginatedObservers(req.user, req.query),
        await observerService.getObserversCount(req.user, req.query.q),
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
        tags: ["Observer"],
        body: upsertObserverInput,
        response: withAuthenticationErrorResponses({
          200: upsertObserverResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const observerCreateResult = await observerService.createObserver(req.body, req.user);

      if (observerCreateResult.isErr()) {
        switch (observerCreateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(observerCreateResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        params: idParamAsNumberSchema,
        body: upsertObserverInput,
        response: withAuthenticationErrorResponses({
          200: upsertObserverResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const observerUpdateResult = await observerService.updateObserver(req.params.id, req.body, req.user);

      if (observerUpdateResult.isErr()) {
        switch (observerUpdateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(observerUpdateResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedObserverResult = await observerService.deleteObserver(req.params.id, req.user);

      if (deletedObserverResult.isErr()) {
        switch (deletedObserverResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedObserver = deletedObserverResult.value;

      if (!deletedObserver) {
        return await reply.notFound();
      }

      const response = deleteObserverResponse.parse(deletedObserver);
      return await reply.send(response);
    },
  );

  done();
};
