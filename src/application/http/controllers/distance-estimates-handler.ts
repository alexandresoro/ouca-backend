import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import {
  getDistanceEstimatesQueryParamsSchema,
  upsertDistanceEstimateInput,
} from "@ou-ca/common/api/distance-estimate.js";
import { distanceEstimateSchema } from "@ou-ca/common/api/entities/distance-estimate.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const distanceEstimatesHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Distance"],
          responses: {
            ...openApiJsonResponse(200, distanceEstimateSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const distanceEstimateResult = await c.var.services.distanceEstimateService.findDistanceEstimate(
            c.req.valid("param").id,
            c.var.user,
          );

          if (distanceEstimateResult.isErr()) {
            switch (distanceEstimateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const distanceEstimate = distanceEstimateResult.value;

          if (!distanceEstimate) {
            return c.notFound();
          }

          const parsedDistanceEstimate = distanceEstimateSchema.parse(distanceEstimate);
          return c.json(parsedDistanceEstimate);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Distance"],
          responses: {
            ...openApiJsonResponse(200, entityInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const distanceEstimateInfoResult = Result.combine([
            await c.var.services.distanceEstimateService.getEntriesCountByDistanceEstimate(
              `${c.req.valid("param").id}`,
              c.var.user,
            ),
            await c.var.services.distanceEstimateService.isDistanceEstimateUsed(
              `${c.req.valid("param").id}`,
              c.var.user,
            ),
          ]);

          if (distanceEstimateInfoResult.isErr()) {
            switch (distanceEstimateInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isDistanceEstimateUsed] = distanceEstimateInfoResult.value;

          const response = entityInfoSchema.parse({
            canBeDeleted: !isDistanceEstimateUsed,
            ownEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Distance"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(distanceEstimateSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getDistanceEstimatesQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.distanceEstimateService.findPaginatedDistanceEstimates(
              c.var.user,
              c.req.valid("query"),
            ),
            await c.var.services.distanceEstimateService.getDistanceEstimatesCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(distanceEstimateSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Distance"],
          responses: {
            ...openApiJsonResponse(200, distanceEstimateSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertDistanceEstimateInput),
        async (c) => {
          const distanceEstimateCreateResult = await c.var.services.distanceEstimateService.createDistanceEstimate(
            c.req.valid("json"),
            c.var.user,
          );

          if (distanceEstimateCreateResult.isErr()) {
            switch (distanceEstimateCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = distanceEstimateSchema.parse(distanceEstimateCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Distance"],
          responses: {
            ...openApiJsonResponse(200, distanceEstimateSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertDistanceEstimateInput),
        async (c) => {
          const distanceEstimateUpdateResult = await c.var.services.distanceEstimateService.updateDistanceEstimate(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (distanceEstimateUpdateResult.isErr()) {
            switch (distanceEstimateUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = distanceEstimateSchema.parse(distanceEstimateUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Distance"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedDistanceEstimateResult = await c.var.services.distanceEstimateService.deleteDistanceEstimate(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedDistanceEstimateResult.isErr()) {
            switch (deletedDistanceEstimateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedDistanceEstimate = deletedDistanceEstimateResult.value;

          if (!deletedDistanceEstimate) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedDistanceEstimate.id });
          return c.json(response);
        },
      )
  );
};
