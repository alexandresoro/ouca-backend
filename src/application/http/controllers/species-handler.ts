import { speciesSchema } from "@ou-ca/common/api/entities/species.js";
import { speciesInfoQueryParamsSchema, speciesInfoSchema } from "@ou-ca/common/api/species.js";
import { getSpeciesQueryParamsSchema, upsertSpeciesInput } from "@ou-ca/common/api/species.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const speciesHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, speciesSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const speciesResult = await c.var.services.speciesService.findSpecies(c.req.valid("param").id, c.var.user);

          if (speciesResult.isErr()) {
            switch (speciesResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const species = speciesResult.value;

          if (!species) {
            return c.notFound();
          }

          const parsedSpecies = speciesSchema.parse(species);
          return c.json(parsedSpecies);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, speciesInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", speciesInfoQueryParamsSchema),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const speciesInfoResult = Result.combine([
            await c.var.services.speciesService.getEntriesCountBySpecies(
              `${c.req.valid("param").id}`,
              c.req.valid("query"),
              c.var.user,
            ),
            await c.var.services.speciesService.isSpeciesUsed(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (speciesInfoResult.isErr()) {
            switch (speciesInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          let totalEntriesCount: number | undefined = undefined;
          if (c.var.user.permissions.canViewAllEntries) {
            // TODO: this should be better handled in the service
            const totalEntriesCountResult = await c.var.services.speciesService.getEntriesCountBySpecies(
              `${c.req.valid("param").id}`,
              c.req.valid("query"),
              c.var.user,
              true,
            );

            if (totalEntriesCountResult.isErr()) {
              switch (totalEntriesCountResult.error) {
                case "notAllowed":
                  throw new HTTPException(403);
              }
            }

            totalEntriesCount = totalEntriesCountResult.value;
          }

          const [ownEntriesCount, isSpeciesUsed] = speciesInfoResult.value;

          const response = speciesInfoSchema.parse({
            canBeDeleted: !isSpeciesUsed,
            ownEntriesCount,
            totalEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(speciesSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getSpeciesQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.speciesService.findPaginatedSpecies(c.var.user, c.req.valid("query")),
            await c.var.services.speciesService.getSpeciesCount(c.var.user, c.req.valid("query")),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(speciesSchema).parse({
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
            ...openApiJsonResponse(200, speciesSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertSpeciesInput),
        async (c) => {
          const speciesCreateResult = await c.var.services.speciesService.createSpecies(
            c.req.valid("json"),
            c.var.user,
          );

          if (speciesCreateResult.isErr()) {
            switch (speciesCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = speciesSchema.parse(speciesCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Species"],
          responses: {
            ...openApiJsonResponse(200, speciesSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertSpeciesInput),
        async (c) => {
          const speciesUpdateResult = await c.var.services.speciesService.updateSpecies(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (speciesUpdateResult.isErr()) {
            switch (speciesUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = speciesSchema.parse(speciesUpdateResult.value);
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
          const deletedSpeciesResult = await c.var.services.speciesService.deleteSpecies(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedSpeciesResult.isErr()) {
            switch (deletedSpeciesResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedSpecies = deletedSpeciesResult.value;

          if (!deletedSpecies) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedSpecies.id });
          return c.json(response);
        },
      )
  );
};
