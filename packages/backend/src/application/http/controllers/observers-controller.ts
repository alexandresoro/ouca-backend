import {
  deleteObserverResponse,
  getObserverResponse,
  getObserversQueryParamsSchema,
  getObserversResponse,
  observerInfoSchema,
  upsertObserverInput,
  upsertObserverResponse,
} from "@ou-ca/common/api/observer";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { idParamAsNumberSchema } from "./api-utils.js";
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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const observerResult = await observerService.findObserver(req.params.id, req.user);

      if (observerResult.isErr()) {
        switch (observerResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const observer = observerResult.value;

      if (!observer) {
        return await reply.status(404).send();
      }

      const response = getObserverResponse.parse(observer);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isObserverUsed] = observerInfoResult.value;

      const response = observerInfoSchema.parse({
        canBeDeleted: !isObserverUsed,
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
        tags: ["Observer"],
        querystring: getObserversQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getObserversResponse.parse({
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
        tags: ["Observer"],
        body: upsertObserverInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const observerCreateResult = await observerService.createObserver(req.body, req.user);

      if (observerCreateResult.isErr()) {
        switch (observerCreateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertObserverResponse.parse(observerCreateResult.value);
      return await reply.send(response);
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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const observerUpdateResult = await observerService.updateObserver(req.params.id, req.body, req.user);

      if (observerUpdateResult.isErr()) {
        switch (observerUpdateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertObserverResponse.parse(observerUpdateResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Observer"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const deletedObserverResult = await observerService.deleteObserver(req.params.id, req.user);

      if (deletedObserverResult.isErr()) {
        switch (deletedObserverResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedObserver = deletedObserverResult.value;

      if (!deletedObserver) {
        return await reply.status(404).send();
      }

      const response = deleteObserverResponse.parse(deletedObserver);
      return await reply.send(response);
    },
  );

  done();
};
