import { speciesClassSchema } from "@ou-ca/common/api/entities/species-class.js";
import { speciesClassInfoSchema } from "@ou-ca/common/api/species-class.js";
import { getClassesQueryParamsSchema, upsertClassInput } from "@ou-ca/common/api/species-class.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const speciesClassesHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, speciesClassSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const speciesClassResult = await c.var.services.classService.findSpeciesClass(
            c.req.valid("param").id,
            c.var.user,
          );

          if (speciesClassResult.isErr()) {
            switch (speciesClassResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const speciesClass = speciesClassResult.value;

          if (!speciesClass) {
            return c.notFound();
          }

          const parsedSpeciesClass = speciesClassSchema.parse(speciesClass);
          return c.json(parsedSpeciesClass);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, speciesClassInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const speciesClassInfoResult = Result.combine([
            await c.var.services.classService.getEntriesCountBySpeciesClass(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.classService.isSpeciesClassUsed(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.classService.getSpeciesCountBySpeciesClass(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (speciesClassInfoResult.isErr()) {
            switch (speciesClassInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isSpeciesClassUsed, speciesCount] = speciesClassInfoResult.value;

          const response = speciesClassInfoSchema.parse({
            canBeDeleted: !isSpeciesClassUsed,
            ownEntriesCount,
            speciesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(speciesClassSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getClassesQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.classService.findPaginatedSpeciesClasses(c.var.user, c.req.valid("query")),
            await c.var.services.classService.getSpeciesClassesCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(speciesClassSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, speciesClassSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertClassInput),
        async (c) => {
          const speciesClassCreateResult = await c.var.services.classService.createSpeciesClass(
            c.req.valid("json"),
            c.var.user,
          );

          if (speciesClassCreateResult.isErr()) {
            switch (speciesClassCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = speciesClassSchema.parse(speciesClassCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, speciesClassSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertClassInput),
        async (c) => {
          const speciesClassUpdateResult = await c.var.services.classService.updateSpeciesClass(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (speciesClassUpdateResult.isErr()) {
            switch (speciesClassUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = speciesClassSchema.parse(speciesClassUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedSpeciesClassResult = await c.var.services.classService.deleteSpeciesClass(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedSpeciesClassResult.isErr()) {
            switch (deletedSpeciesClassResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedSpeciesClass = deletedSpeciesClassResult.value;

          if (!deletedSpeciesClass) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedSpeciesClass.id });
          return c.json(response);
        },
      )
  );
};
