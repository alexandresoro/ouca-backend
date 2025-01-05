import {
  getLocalitiesQueryParamsSchema,
  getLocalitiesResponse,
  getLocalityResponse,
  localityInfoSchema,
  upsertLocalityInput,
  upsertLocalityResponse,
} from "@ou-ca/common/api/locality";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const localitiesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { localityService, townService, departmentService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: getLocalityResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const localityResult = await localityService.findLocality(req.params.id, req.user);

      if (localityResult.isErr()) {
        switch (localityResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const locality = localityResult.value;

      if (!locality) {
        return await reply.notFound();
      }

      return await reply.send(locality);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: localityInfoSchema,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const localityInfoResult = Result.combine([
        await localityService.getEntriesCountByLocality(`${req.params.id}`, req.user),
        await localityService.isLocalityUsed(`${req.params.id}`, req.user),
        await townService.findTownOfLocalityId(`${req.params.id}`, req.user),
      ]);

      if (localityInfoResult.isErr()) {
        switch (localityInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isLocalityUsed, town] = localityInfoResult.value;

      if (!town) {
        return await reply.notFound();
      }

      const departmentResult = await departmentService.findDepartmentOfTownId(town.id, req.user);

      if (departmentResult.isErr()) {
        switch (departmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      if (!departmentResult.value) {
        return await reply.notFound();
      }

      return await reply.send({
        canBeDeleted: !isLocalityUsed,
        ownEntriesCount,
        townCode: town.code,
        townName: town.nom,
        departmentCode: departmentResult.value.code,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        querystring: getLocalitiesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getLocalitiesResponse,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await localityService.findPaginatedLocalities(req.user, req.query),
        await localityService.getLocalitiesCount(req.user, req.query),
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
        tags: ["Location"],
        body: upsertLocalityInput,
        response: withAuthenticationErrorResponses({
          200: upsertLocalityResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const localityCreateResult = await localityService.createLocality(req.body, req.user);

      if (localityCreateResult.isErr()) {
        switch (localityCreateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(localityCreateResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        body: upsertLocalityInput,
        response: withAuthenticationErrorResponses({
          200: upsertLocalityResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const localityUpdateResult = await localityService.updateLocality(req.params.id, req.body, req.user);

      if (localityUpdateResult.isErr()) {
        switch (localityUpdateResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(localityUpdateResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedLocalityResult = await localityService.deleteLocality(req.params.id, req.user);

      if (deletedLocalityResult.isErr()) {
        switch (deletedLocalityResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedLocality = deletedLocalityResult.value;

      if (!deletedLocality) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedLocality.id });
    },
  );

  done();
};
