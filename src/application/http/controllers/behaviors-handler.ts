import { getBehaviorsQueryParamsSchema, upsertBehaviorInput } from "@ou-ca/common/api/behavior.js";
import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import { behaviorSchema } from "@ou-ca/common/api/entities/behavior.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const behaviorsHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Behavior"],
          responses: {
            ...openApiJsonResponse(200, behaviorSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const behaviorResult = await c.var.services.behaviorService.findBehavior(c.req.valid("param").id, c.var.user);

          if (behaviorResult.isErr()) {
            switch (behaviorResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const behavior = behaviorResult.value;

          if (!behavior) {
            return c.notFound();
          }

          const parsedBehavior = behaviorSchema.parse(behavior);
          return c.json(parsedBehavior);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Behavior"],
          responses: {
            ...openApiJsonResponse(200, entityInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const behaviorInfoResult = Result.combine([
            await c.var.services.behaviorService.getEntriesCountByBehavior(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.behaviorService.isBehaviorUsed(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (behaviorInfoResult.isErr()) {
            switch (behaviorInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isBehaviorUsed] = behaviorInfoResult.value;

          const response = entityInfoSchema.parse({
            canBeDeleted: !isBehaviorUsed,
            ownEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Behavior"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(behaviorSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getBehaviorsQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.behaviorService.findPaginatedBehaviors(c.var.user, c.req.valid("query")),
            await c.var.services.behaviorService.getBehaviorsCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(behaviorSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Behavior"],
          responses: {
            ...openApiJsonResponse(200, behaviorSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertBehaviorInput),
        async (c) => {
          const behaviorCreateResult = await c.var.services.behaviorService.createBehavior(
            c.req.valid("json"),
            c.var.user,
          );

          if (behaviorCreateResult.isErr()) {
            switch (behaviorCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = behaviorSchema.parse(behaviorCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Behavior"],
          responses: {
            ...openApiJsonResponse(200, behaviorSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertBehaviorInput),
        async (c) => {
          const behaviorUpdateResult = await c.var.services.behaviorService.updateBehavior(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (behaviorUpdateResult.isErr()) {
            switch (behaviorUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = behaviorSchema.parse(behaviorUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Behavior"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedBehaviorResult = await c.var.services.behaviorService.deleteBehavior(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedBehaviorResult.isErr()) {
            switch (deletedBehaviorResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedBehavior = deletedBehaviorResult.value;

          if (!deletedBehavior) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedBehavior.id });
          return c.json(response);
        },
      )
  );
};
