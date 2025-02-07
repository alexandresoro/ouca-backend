import { ageSchema } from "@ou-ca/common/api/entities/age.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import "zod-openapi/extend";
import {
  ENTITIES_WITH_LABEL_ORDER_BY_ELEMENTS,
  entitiesCommonQueryParamsSchema,
} from "@ou-ca/common/api/common/entitiesSearchParams.js";
import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

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

export const agesHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Age"],
          responses: {
            ...openApiJsonResponse(200, ageSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const ageResult = await c.var.services.ageService.findAge(c.req.valid("param").id, c.var.user);

          if (ageResult.isErr()) {
            switch (ageResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const age = ageResult.value;

          if (!age) {
            return c.notFound();
          }

          const parsedAge = ageSchema.parse(age);
          return c.json(parsedAge);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Age"],
          responses: {
            ...openApiJsonResponse(200, entityInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const ageInfoResult = Result.combine([
            await c.var.services.ageService.getEntriesCountByAge(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.ageService.isAgeUsed(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (ageInfoResult.isErr()) {
            switch (ageInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isAgeUsed] = ageInfoResult.value;

          const response = entityInfoSchema.parse({
            canBeDeleted: !isAgeUsed,
            ownEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Age"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(ageSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getAgesQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.ageService.findPaginatedAges(c.var.user, c.req.valid("query")),
            await c.var.services.ageService.getAgesCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(ageSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Age"],
          responses: {
            ...openApiJsonResponse(200, ageSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertAgeInputApiSchema),
        async (c) => {
          const ageCreateResult = await c.var.services.ageService.createAge(c.req.valid("json"), c.var.user);

          if (ageCreateResult.isErr()) {
            switch (ageCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = ageSchema.parse(ageCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Age"],
          responses: {
            ...openApiJsonResponse(200, ageSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertAgeInputApiSchema),
        async (c) => {
          const ageUpdateResult = await c.var.services.ageService.updateAge(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (ageUpdateResult.isErr()) {
            switch (ageUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = ageSchema.parse(ageUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Age"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedAgeResult = await c.var.services.ageService.deleteAge(c.req.valid("param").id, c.var.user);

          if (deletedAgeResult.isErr()) {
            switch (deletedAgeResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedAge = deletedAgeResult.value;

          if (!deletedAge) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedAge.id });
          return c.json(response);
        },
      )
  );
};
