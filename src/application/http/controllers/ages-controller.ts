import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "@ou-ca/common/api/common/entitiesSearchParams.js";
import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import { ageSchema } from "@ou-ca/common/api/entities/age.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import "zod-openapi/extend";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";

const getAgesQueryParamsSchema = entitiesCommonQueryParamsSchema.extend({
  orderBy: z.enum(ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS).optional(),
});

export const upsertAgeInputApiSchema = z
  .object({
    libelle: z.string().trim().min(1),
  })
  .openapi({
    ref: "UpsertAgeInput",
  });

export const agesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { ageService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Age"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: ageSchema,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const ageResult = await ageService.findAge(req.params.id, req.user);

      if (ageResult.isErr()) {
        switch (ageResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const age = ageResult.value;

      if (!age) {
        return await reply.notFound();
      }

      return await reply.send(age);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Age"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: entityInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const ageInfoResult = Result.combine([
        await ageService.getEntriesCountByAge(`${req.params.id}`, req.user),
        await ageService.isAgeUsed(`${req.params.id}`, req.user),
      ]);

      if (ageInfoResult.isErr()) {
        switch (ageInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isAgeUsed] = ageInfoResult.value;

      return await reply.send({
        canBeDeleted: !isAgeUsed,
        ownEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Age"],
        querystring: getAgesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getPaginatedResponseSchema(ageSchema),
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await ageService.findPaginatedAges(req.user, req.query),
        await ageService.getAgesCount(req.user, req.query.q),
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
        tags: ["Age"],
        body: upsertAgeInputApiSchema,
        response: withAuthenticationErrorResponses({
          200: ageSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const ageCreateResult = await ageService.createAge(req.body, req.user);

      if (ageCreateResult.isErr()) {
        switch (ageCreateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(ageCreateResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Age"],
        params: idParamAsNumberSchema,
        body: upsertAgeInputApiSchema,
        response: withAuthenticationErrorResponses({
          200: ageSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const ageUpdateResult = await ageService.updateAge(req.params.id, req.body, req.user);

      if (ageUpdateResult.isErr()) {
        switch (ageUpdateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(ageUpdateResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Age"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedAgeResult = await ageService.deleteAge(req.params.id, req.user);

      if (deletedAgeResult.isErr()) {
        switch (deletedAgeResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedAge = deletedAgeResult.value;

      if (!deletedAge) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedAge.id });
    },
  );

  done();
};
