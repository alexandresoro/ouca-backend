import { entrySchema } from "@ou-ca/common/api/entities/entry.js";
import { getEntriesQueryParamsSchema, upsertEntryInput } from "@ou-ca/common/api/entry.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { enrichedEntry } from "./entries-enricher.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const entriesHandler = (factory: ApiV1Factory) => {
  return factory
    .createApp()
    .get(
      "/:id",
      describeRoute({
        tags: ["Entry"],
        responses: {
          ...openApiJsonResponse(200, entrySchema),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamSchema),
      async (c) => {
        const entryResult = await c.var.services.entryService.findEntry(c.req.valid("param").id, c.var.user);

        if (entryResult.isErr()) {
          switch (entryResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const entry = entryResult.value;

        if (!entry) {
          return c.notFound();
        }

        const entryEnrichedResult = await enrichedEntry(c.var.services, entry, c.var.user);

        if (entryEnrichedResult.isErr()) {
          switch (entryEnrichedResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "extendedDataNotFound":
              return c.notFound();
          }
        }

        const response = entrySchema.parse(entryEnrichedResult.value);
        return c.json(response);
      },
    )
    .get(
      "/",
      describeRoute({
        tags: ["Entry"],
        responses: {
          ...openApiJsonResponse(200, getPaginatedResponseSchema(entrySchema)),
          ...openApiDefaultErrorResponses([403, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("query", getEntriesQueryParamsSchema),
      async (c) => {
        if (c.req.valid("query").fromAllUsers && !c.var.user?.permissions.canViewAllEntries) {
          throw new HTTPException(403);
        }

        const paginatedResults = Result.combine([
          await c.var.services.entryService.findPaginatedEntries(c.var.user, c.req.valid("query")),
          await c.var.services.entryService.getEntriesCount(c.var.user, c.req.valid("query")),
        ]);

        if (paginatedResults.isErr()) {
          switch (paginatedResults.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const [entriesData, count] = paginatedResults.value;

        // TODO look to optimize this request
        const enrichedEntriesResults = await Promise.all(
          entriesData.map(async (entryData) => {
            return enrichedEntry(c.var.services, entryData, c.var.user);
          }),
        );

        const enrichedEntries = enrichedEntriesResults.map((enrichedEntryResult) =>
          enrichedEntryResult._unsafeUnwrap(),
        );

        const response = getPaginatedResponseSchema(entrySchema).parse({
          data: enrichedEntries,
          meta: getPaginationMetadata(count, c.req.valid("query")),
        });
        return c.json(response);
      },
    )
    .post(
      "/",
      describeRoute({
        tags: ["Entry"],
        responses: {
          ...openApiJsonResponse(200, entrySchema),
          ...openApiJsonResponse(409, z.object({ correspondingEntryFound: z.string() })),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("json", upsertEntryInput),
      async (c) => {
        const entryResult = await c.var.services.entryService.createEntry(c.req.valid("json"), c.var.user);

        if (entryResult.isErr()) {
          switch (entryResult.error.type) {
            case "notAllowed":
              throw new HTTPException(403);
            case "similarEntryAlreadyExists": {
              const response = z
                .object({ correspondingEntryFound: z.string() })
                .parse({ correspondingEntryFound: entryResult.error.correspondingEntryFound });
              return c.json(response, 409);
            }
          }
        }

        const entry = entryResult.value;

        const entryEnrichedResult = await enrichedEntry(c.var.services, entry, c.var.user);

        if (entryEnrichedResult.isErr()) {
          switch (entryEnrichedResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "extendedDataNotFound":
              return c.notFound();
          }
        }

        const entryEnriched = entryEnrichedResult.value;

        const response = entrySchema.parse(entryEnriched);
        return c.json(response);
      },
    )
    .put(
      "/:id",
      describeRoute({
        tags: ["Entry"],
        responses: {
          ...openApiJsonResponse(200, entrySchema),
          ...openApiJsonResponse(409, z.object({ correspondingEntryFound: z.string() })),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamSchema),
      zodValidator("json", upsertEntryInput),
      async (c) => {
        const entryResult = await c.var.services.entryService.updateEntry(
          c.req.valid("param").id,
          c.req.valid("json"),
          c.var.user,
        );

        if (entryResult.isErr()) {
          switch (entryResult.error.type) {
            case "notAllowed":
              throw new HTTPException(403);
            case "similarEntryAlreadyExists": {
              const response = z
                .object({ correspondingEntryFound: z.string() })
                .parse({ correspondingEntryFound: entryResult.error.correspondingEntryFound });
              return c.json(response, 409);
            }
          }
        }

        const entry = entryResult.value;

        const entryEnrichedResult = await enrichedEntry(c.var.services, entry, c.var.user);

        if (entryEnrichedResult.isErr()) {
          switch (entryEnrichedResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "extendedDataNotFound":
              return c.notFound();
          }
        }

        const entryEnriched = entryEnrichedResult.value;

        const response = entrySchema.parse(entryEnriched);
        return c.json(response);
      },
    )
    .delete(
      "/:id",
      describeRoute({
        tags: ["Entry"],
        responses: {
          ...openApiJsonResponse(200, z.object({ id: z.string() })),
          ...openApiDefaultErrorResponses([403, 404, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamSchema),
      async (c) => {
        const deletedEntryResult = await c.var.services.entryService.deleteEntry(c.req.valid("param").id, c.var.user);

        if (deletedEntryResult.isErr()) {
          switch (deletedEntryResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const deletedEntry = deletedEntryResult.value;

        if (!deletedEntry) {
          return c.notFound();
        }

        const response = z.object({ id: z.string() }).parse({ id: deletedEntry.id });
        return c.json(response);
      },
    );
};
