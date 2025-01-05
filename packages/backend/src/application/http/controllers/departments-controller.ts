import {
  departmentInfoSchema,
  getDepartmentResponse,
  getDepartmentsQueryParamsSchema,
  getDepartmentsResponse,
  upsertDepartmentInput,
  upsertDepartmentResponse,
} from "@ou-ca/common/api/department";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";

export const departmentsController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { departmentService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const departmentResult = await departmentService.findDepartment(req.params.id, req.user);

      if (departmentResult.isErr()) {
        switch (departmentResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const department = departmentResult.value;

      if (!department) {
        return await reply.status(404).send();
      }

      const response = getDepartmentResponse.parse(department);
      return await reply.send(response);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const departmentInfoResult = Result.combine([
        await departmentService.getEntriesCountByDepartment(`${req.params.id}`, req.user),
        await departmentService.isDepartmentUsed(`${req.params.id}`, req.user),
        await departmentService.getLocalitiesCountByDepartment(`${req.params.id}`, req.user),
        await departmentService.getTownsCountByDepartment(`${req.params.id}`, req.user),
      ]);

      if (departmentInfoResult.isErr()) {
        switch (departmentInfoResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [ownEntriesCount, isDepartmentUsed, localitiesCount, townsCount] = departmentInfoResult.value;

      const response = departmentInfoSchema.parse({
        canBeDeleted: !isDepartmentUsed,
        ownEntriesCount,
        localitiesCount,
        townsCount,
      });

      return await reply.send(response);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        querystring: getDepartmentsQueryParamsSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await departmentService.findPaginatedDepartments(req.user, req.query),
        await departmentService.getDepartmentsCount(req.user, req.query.q),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      const [data, count] = paginatedResults.value;

      const response = getDepartmentsResponse.parse({
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
        tags: ["Location"],
        body: upsertDepartmentInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const departmentResult = await departmentService.createDepartment(req.body, req.user);

      if (departmentResult.isErr()) {
        switch (departmentResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertDepartmentResponse.parse(departmentResult.value);
      return await reply.send(response);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        params: idParamAsNumberSchema,
        body: upsertDepartmentInput,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const departmentResult = await departmentService.updateDepartment(req.params.id, req.body, req.user);

      if (departmentResult.isErr()) {
        switch (departmentResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "alreadyExists":
            return await reply.status(409).send();
        }
      }

      const response = upsertDepartmentResponse.parse(departmentResult.value);
      return await reply.send(response);
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
      const deletedDepartmentResult = await departmentService.deleteDepartment(req.params.id, req.user);

      if (deletedDepartmentResult.isErr()) {
        switch (deletedDepartmentResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
          case "isUsed":
            return await reply.status(409).send();
        }
      }

      const deletedDepartment = deletedDepartmentResult.value;

      if (!deletedDepartment) {
        return await reply.status(404).send();
      }

      return await reply.send({ id: deletedDepartment.id });
    },
  );

  done();
};
