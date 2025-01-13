import {
  departmentInfoSchema,
  getDepartmentsQueryParamsSchema,
  upsertDepartmentInput,
} from "@ou-ca/common/api/department.js";
import { departmentSchema } from "@ou-ca/common/api/entities/department.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";

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
        response: withAuthenticationErrorResponses({
          200: departmentSchema,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const departmentResult = await departmentService.findDepartment(req.params.id, req.user);

      if (departmentResult.isErr()) {
        switch (departmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const department = departmentResult.value;

      if (!department) {
        return await reply.notFound();
      }

      return await reply.send(department);
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
          200: departmentInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
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
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isDepartmentUsed, localitiesCount, townsCount] = departmentInfoResult.value;

      return await reply.send({
        canBeDeleted: !isDepartmentUsed,
        ownEntriesCount,
        localitiesCount,
        townsCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Location"],
        querystring: getDepartmentsQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getPaginatedResponseSchema(departmentSchema),
          ...buildFastifyDefaultErrorResponses([403]),
        }),
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
        body: upsertDepartmentInput,
        response: withAuthenticationErrorResponses({
          200: departmentSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const departmentResult = await departmentService.createDepartment(req.body, req.user);

      if (departmentResult.isErr()) {
        switch (departmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(departmentResult.value);
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
        response: withAuthenticationErrorResponses({
          200: departmentSchema,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const departmentResult = await departmentService.updateDepartment(req.params.id, req.body, req.user);

      if (departmentResult.isErr()) {
        switch (departmentResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(departmentResult.value);
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
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedDepartment = deletedDepartmentResult.value;

      if (!deletedDepartment) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedDepartment.id });
    },
  );

  done();
};
