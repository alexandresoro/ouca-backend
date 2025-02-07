import { departmentInfoSchema } from "@ou-ca/common/api/department.js";
import { getDepartmentsQueryParamsSchema, upsertDepartmentInput } from "@ou-ca/common/api/department.js";
import { departmentSchema } from "@ou-ca/common/api/entities/department.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const departmentsHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, departmentSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const departmentResult = await c.var.services.departmentService.findDepartment(
            c.req.valid("param").id,
            c.var.user,
          );

          if (departmentResult.isErr()) {
            switch (departmentResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const department = departmentResult.value;

          if (!department) {
            return c.notFound();
          }

          const parsedDepartment = departmentSchema.parse(department);
          return c.json(parsedDepartment);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, departmentInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const departmentInfoResult = Result.combine([
            await c.var.services.departmentService.getEntriesCountByDepartment(
              `${c.req.valid("param").id}`,
              c.var.user,
            ),
            await c.var.services.departmentService.isDepartmentUsed(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.departmentService.getLocalitiesCountByDepartment(
              `${c.req.valid("param").id}`,
              c.var.user,
            ),
            await c.var.services.departmentService.getTownsCountByDepartment(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (departmentInfoResult.isErr()) {
            switch (departmentInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isDepartmentUsed, localitiesCount, townsCount] = departmentInfoResult.value;

          const response = departmentInfoSchema.parse({
            canBeDeleted: !isDepartmentUsed,
            ownEntriesCount,
            localitiesCount,
            townsCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(departmentSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getDepartmentsQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.departmentService.findPaginatedDepartments(c.var.user, c.req.valid("query")),
            await c.var.services.departmentService.getDepartmentsCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(departmentSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, departmentSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertDepartmentInput),
        async (c) => {
          const departmentCreateResult = await c.var.services.departmentService.createDepartment(
            c.req.valid("json"),
            c.var.user,
          );

          if (departmentCreateResult.isErr()) {
            switch (departmentCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = departmentSchema.parse(departmentCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, departmentSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertDepartmentInput),
        async (c) => {
          const departmentUpdateResult = await c.var.services.departmentService.updateDepartment(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (departmentUpdateResult.isErr()) {
            switch (departmentUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = departmentSchema.parse(departmentUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedDepartmentResult = await c.var.services.departmentService.deleteDepartment(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedDepartmentResult.isErr()) {
            switch (deletedDepartmentResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedDepartment = deletedDepartmentResult.value;

          if (!deletedDepartment) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedDepartment.id });
          return c.json(response);
        },
      )
  );
};
