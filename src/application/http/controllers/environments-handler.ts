import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import { environmentSchema } from "@ou-ca/common/api/entities/environment.js";
import { getEnvironmentsQueryParamsSchema, upsertEnvironmentInput } from "@ou-ca/common/api/environment.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const environmentsHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Environment"],
          responses: {
            ...openApiJsonResponse(200, environmentSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const environmentResult = await c.var.services.environmentService.findEnvironment(
            c.req.valid("param").id,
            c.var.user,
          );

          if (environmentResult.isErr()) {
            switch (environmentResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const environment = environmentResult.value;

          if (!environment) {
            return c.notFound();
          }

          const parsedEnvironment = environmentSchema.parse(environment);
          return c.json(parsedEnvironment);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Environment"],
          responses: {
            ...openApiJsonResponse(200, entityInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const environmentInfoResult = Result.combine([
            await c.var.services.environmentService.getEntriesCountByEnvironment(
              `${c.req.valid("param").id}`,
              c.var.user,
            ),
            await c.var.services.environmentService.isEnvironmentUsed(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (environmentInfoResult.isErr()) {
            switch (environmentInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isEnvironmentUsed] = environmentInfoResult.value;

          const response = entityInfoSchema.parse({
            canBeDeleted: !isEnvironmentUsed,
            ownEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Environment"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(environmentSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getEnvironmentsQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.environmentService.findPaginatedEnvironments(c.var.user, c.req.valid("query")),
            await c.var.services.environmentService.getEnvironmentsCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(environmentSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Environment"],
          responses: {
            ...openApiJsonResponse(200, environmentSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertEnvironmentInput),
        async (c) => {
          const environmentCreateResult = await c.var.services.environmentService.createEnvironment(
            c.req.valid("json"),
            c.var.user,
          );

          if (environmentCreateResult.isErr()) {
            switch (environmentCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = environmentSchema.parse(environmentCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Environment"],
          responses: {
            ...openApiJsonResponse(200, environmentSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertEnvironmentInput),
        async (c) => {
          const environmentUpdateResult = await c.var.services.environmentService.updateEnvironment(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (environmentUpdateResult.isErr()) {
            switch (environmentUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = environmentSchema.parse(environmentUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Environment"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedEnvironmentResult = await c.var.services.environmentService.deleteEnvironment(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedEnvironmentResult.isErr()) {
            switch (deletedEnvironmentResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedEnvironment = deletedEnvironmentResult.value;

          if (!deletedEnvironment) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedEnvironment.id });
          return c.json(response);
        },
      )
  );
};
