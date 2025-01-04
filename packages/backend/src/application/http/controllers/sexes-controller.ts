import {
  getSexResponse,
  getSexesQueryParamsSchema,
  getSexesResponse,
  sexInfoSchema,
  upsertSexInput,
  upsertSexResponse,
} from "@ou-ca/common/api/sex";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const sexResult = await sexService.findSex(req.params.id, req.user);

      if (sexResult.isErr()) {
        switch (sexResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const sex = sexResult.value;

      if (!sex) {
        return await reply.status(404).send();
      }

      const response = getSexResponse.parse(sex);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Sex"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isSexUsed] = sexInfoResult.value;

      const response = sexInfoSchema.parse({
        canBeDeleted: !isSexUsed,
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
        tags: ["Sex"],
        querystring: getSexesQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
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
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getSexesResponse.parse({
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
        tags: ["Sex"],
        body: upsertSexInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const sexCreateResult = await sexService.createSex(req.body, req.user);

      if (sexCreateResult.isErr()) {
        switch (sexCreateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertSexResponse.parse(sexCreateResult.value);
      return await reply.send(response);
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
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const sexUpdateResult = await sexService.updateSex(req.params.id, req.body, req.user);

      if (sexUpdateResult.isErr()) {
        switch (sexUpdateResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertSexResponse.parse(sexUpdateResult.value);
      return await reply.send(response);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Sex"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const deletedSexResult = await sexService.deleteSex(req.params.id, req.user);

      if (deletedSexResult.isErr()) {
        switch (deletedSexResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedSex = deletedSexResult.value;

      if (!deletedSex) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedSex.id });
    },
  );

  done();
};
