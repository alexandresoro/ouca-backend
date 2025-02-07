import { townSchema } from "@ou-ca/common/api/entities/town.js";
import { townInfoSchema } from "@ou-ca/common/api/town.js";
import { getTownsQueryParamsSchema, upsertTownInput } from "@ou-ca/common/api/town.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const townsHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, townSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const townResult = await c.var.services.townService.findTown(c.req.valid("param").id, c.var.user);

          if (townResult.isErr()) {
            switch (townResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const town = townResult.value;

          if (!town) {
            return c.notFound();
          }

          const parsedTown = townSchema.parse(town);
          return c.json(parsedTown);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, townInfoSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const townInfoResult = Result.combine([
            await c.var.services.townService.getEntriesCountByTown(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.townService.isTownUsed(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.townService.getLocalitiesCountByTown(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.departmentService.findDepartmentOfTownId(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (townInfoResult.isErr()) {
            switch (townInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isTownUsed, localitiesCount, department] = townInfoResult.value;

          if (!department) {
            return c.notFound();
          }

          const response = townInfoSchema.parse({
            canBeDeleted: !isTownUsed,
            ownEntriesCount,
            departmentCode: department.code,
            localitiesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(townSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getTownsQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.townService.findPaginatedTowns(c.var.user, c.req.valid("query")),
            await c.var.services.townService.getTownsCount(c.var.user, c.req.valid("query")),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(townSchema).parse({
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
            ...openApiJsonResponse(200, townSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertTownInput),
        async (c) => {
          const townCreateResult = await c.var.services.townService.createTown(c.req.valid("json"), c.var.user);

          if (townCreateResult.isErr()) {
            switch (townCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = townSchema.parse(townCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, townSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertTownInput),
        async (c) => {
          const townUpdateResult = await c.var.services.townService.updateTown(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (townUpdateResult.isErr()) {
            switch (townUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = townSchema.parse(townUpdateResult.value);
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
          const deletedTownResult = await c.var.services.townService.deleteTown(c.req.valid("param").id, c.var.user);

          if (deletedTownResult.isErr()) {
            switch (deletedTownResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedTown = deletedTownResult.value;

          if (!deletedTown) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedTown.id });
          return c.json(response);
        },
      )
  );
};
