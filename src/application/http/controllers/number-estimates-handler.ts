import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import { numberEstimateSchema } from "@ou-ca/common/api/entities/number-estimate.js";
import { getNumberEstimatesQueryParamsSchema, upsertNumberEstimateInput } from "@ou-ca/common/api/number-estimate.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const numberEstimatesHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Quantity"],
          responses: {
            ...openApiJsonResponse(200, numberEstimateSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const numberEstimateResult = await c.var.services.numberEstimateService.findNumberEstimate(
            c.req.valid("param").id,
            c.var.user,
          );

          if (numberEstimateResult.isErr()) {
            switch (numberEstimateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const numberEstimate = numberEstimateResult.value;

          if (!numberEstimate) {
            return c.notFound();
          }

          const parsedNumberEstimate = numberEstimateSchema.parse(numberEstimate);
          return c.json(parsedNumberEstimate);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Quantity"],
          responses: {
            ...openApiJsonResponse(200, entityInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const numberEstimateInfoResult = Result.combine([
            await c.var.services.numberEstimateService.getEntriesCountByNumberEstimate(
              `${c.req.valid("param").id}`,
              c.var.user,
            ),
            await c.var.services.numberEstimateService.isNumberEstimateUsed(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (numberEstimateInfoResult.isErr()) {
            switch (numberEstimateInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isNumberEstimateUsed] = numberEstimateInfoResult.value;

          const response = entityInfoSchema.parse({
            canBeDeleted: !isNumberEstimateUsed,
            ownEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Quantity"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(numberEstimateSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getNumberEstimatesQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.numberEstimateService.findPaginatesNumberEstimates(c.var.user, c.req.valid("query")),
            await c.var.services.numberEstimateService.getNumberEstimatesCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(numberEstimateSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Quantity"],
          responses: {
            ...openApiJsonResponse(200, numberEstimateSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertNumberEstimateInput),
        async (c) => {
          const numberEstimateCreateResult = await c.var.services.numberEstimateService.createNumberEstimate(
            c.req.valid("json"),
            c.var.user,
          );

          if (numberEstimateCreateResult.isErr()) {
            switch (numberEstimateCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = numberEstimateSchema.parse(numberEstimateCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Quantity"],
          responses: {
            ...openApiJsonResponse(200, numberEstimateSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertNumberEstimateInput),
        async (c) => {
          const numberEstimateUpdateResult = await c.var.services.numberEstimateService.updateNumberEstimate(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (numberEstimateUpdateResult.isErr()) {
            switch (numberEstimateUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = numberEstimateSchema.parse(numberEstimateUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Quantity"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedNumberEstimateResult = await c.var.services.numberEstimateService.deleteNumberEstimate(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedNumberEstimateResult.isErr()) {
            switch (deletedNumberEstimateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedNumberEstimate = deletedNumberEstimateResult.value;

          if (!deletedNumberEstimate) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedNumberEstimate.id });
          return c.json(response);
        },
      )
  );
};
