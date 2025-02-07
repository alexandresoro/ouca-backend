import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import { sexSchema } from "@ou-ca/common/api/entities/sex.js";
import { getSexesQueryParamsSchema, upsertSexInput } from "@ou-ca/common/api/sex.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const sexesHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Sex"],
          responses: {
            ...openApiJsonResponse(200, sexSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const sexResult = await c.var.services.sexService.findSex(c.req.valid("param").id, c.var.user);

          if (sexResult.isErr()) {
            switch (sexResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const sex = sexResult.value;

          if (!sex) {
            return c.notFound();
          }

          const parsedSex = sexSchema.parse(sex);
          return c.json(parsedSex);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Sex"],
          responses: {
            ...openApiJsonResponse(200, entityInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const sexInfoResult = Result.combine([
            await c.var.services.sexService.getEntriesCountBySex(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.sexService.isSexUsed(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (sexInfoResult.isErr()) {
            switch (sexInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isSexUsed] = sexInfoResult.value;

          const response = entityInfoSchema.parse({
            canBeDeleted: !isSexUsed,
            ownEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Sex"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(sexSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getSexesQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.sexService.findPaginatedSexes(c.var.user, c.req.valid("query")),
            await c.var.services.sexService.getSexesCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(sexSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Sex"],
          responses: {
            ...openApiJsonResponse(200, sexSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertSexInput),
        async (c) => {
          const sexCreateResult = await c.var.services.sexService.createSex(c.req.valid("json"), c.var.user);

          if (sexCreateResult.isErr()) {
            switch (sexCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = sexSchema.parse(sexCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Sex"],
          responses: {
            ...openApiJsonResponse(200, sexSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertSexInput),
        async (c) => {
          const sexUpdateResult = await c.var.services.sexService.updateSex(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (sexUpdateResult.isErr()) {
            switch (sexUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = sexSchema.parse(sexUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Sex"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedSexResult = await c.var.services.sexService.deleteSex(c.req.valid("param").id, c.var.user);

          if (deletedSexResult.isErr()) {
            switch (deletedSexResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedSex = deletedSexResult.value;

          if (!deletedSex) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedSex.id });
          return c.json(response);
        },
      )
  );
};
