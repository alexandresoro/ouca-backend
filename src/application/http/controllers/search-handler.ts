import { speciesSchema } from "@ou-ca/common/api/entities/species.js";
import { getSpeciesQueryParamsSchema } from "@ou-ca/common/api/species.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import type { ApiV1Factory } from "../context.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const searchHandler = (factory: ApiV1Factory) => {
  return factory.createApp().get(
    "/species",
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
      if (c.req.valid("query").fromAllUsers && !c.var.user?.permissions.canViewAllEntries) {
        throw new HTTPException(403);
      }

      // If we don't want to see all users' species, we need to filter by ownerId
      const reshapedQueryParams = {
        ...c.req.valid("query"),
        ownerId: c.req.valid("query").fromAllUsers ? undefined : c.var.user.id,
      };

      const paginatedResults = Result.combine([
        await c.var.services.speciesService.findPaginatedSpecies(c.var.user, reshapedQueryParams),
        await c.var.services.speciesService.getSpeciesCount(c.var.user, reshapedQueryParams),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            throw new HTTPException(403);
        }
      }

      const [speciesData, count] = paginatedResults.value;

      const response = getPaginatedResponseSchema(speciesSchema).parse({
        data: speciesData,
        meta: getPaginationMetadata(count, c.req.valid("query")),
      });
      return c.json(response);
    },
  );
};
