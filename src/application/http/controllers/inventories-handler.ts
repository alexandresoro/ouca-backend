import { inventorySchema } from "@ou-ca/common/api/entities/inventory.js";
import {
  getInventoriesQueryParamsSchema,
  getInventoryIndexParamsSchema,
  getInventoryIndexResponse,
  upsertInventoryInput,
} from "@ou-ca/common/api/inventory.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import { logger } from "../../../utils/logger.js";
import type { ApiV1Factory } from "../context.js";
import { idParamSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";
import { enrichedInventory } from "./inventories-enricher.js";

export const inventoriesHandler = (factory: ApiV1Factory) => {
  return factory
    .createApp()
    .get(
      "/:id",
      describeRoute({
        tags: ["Inventory"],
        responses: {
          ...openApiJsonResponse(200, inventorySchema),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamSchema),
      async (c) => {
        const inventoryResult = await c.var.services.inventoryService.findInventory(
          c.req.valid("param").id,
          c.var.user,
        );

        if (inventoryResult.isErr()) {
          switch (inventoryResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const inventory = inventoryResult.value;

        if (!inventory) {
          return c.notFound();
        }

        const inventoryEnrichedResult = await enrichedInventory(c.var.services, inventory, c.var.user);

        if (inventoryEnrichedResult.isErr()) {
          switch (inventoryEnrichedResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "extendedDataNotFound":
              return c.notFound();
          }
        }

        const response = inventorySchema.parse(inventoryEnrichedResult.value);
        return c.json(response);
      },
    )
    .get(
      "/:id/index",
      describeRoute({
        tags: ["Inventory"],
        responses: {
          ...openApiJsonResponse(200, getInventoryIndexResponse),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("query", getInventoryIndexParamsSchema),
      zodValidator("param", idParamSchema),
      async (c) => {
        const inventoryIndexResult = await c.var.services.inventoryService.findInventoryIndex(
          c.req.valid("param").id,
          c.req.valid("query"),
          c.var.user,
        );

        if (inventoryIndexResult.isErr()) {
          switch (inventoryIndexResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const inventoryIndex = inventoryIndexResult.value;

        if (inventoryIndex == null) {
          return c.notFound();
        }
        const response = getInventoryIndexResponse.parse(inventoryIndex);
        return c.json(response);
      },
    )
    .get(
      "/",
      describeRoute({
        tags: ["Inventory"],
        responses: {
          ...openApiJsonResponse(200, getPaginatedResponseSchema(inventorySchema)),
          ...openApiDefaultErrorResponses([403, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("query", getInventoriesQueryParamsSchema),
      async (c) => {
        const paginatedResults = Result.combine([
          await c.var.services.inventoryService.findPaginatedInventories(c.var.user, c.req.valid("query")),
          await c.var.services.inventoryService.getInventoriesCount(c.var.user),
        ]);

        if (paginatedResults.isErr()) {
          switch (paginatedResults.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const [inventoriesData, count] = paginatedResults.value;

        // TODO look to optimize this request
        const enrichedInventoriesResults = await Promise.all(
          inventoriesData.map(async (inventoryData) => {
            return enrichedInventory(c.var.services, inventoryData, c.var.user);
          }),
        );

        const response = getPaginatedResponseSchema(inventorySchema).parse({
          data: enrichedInventoriesResults.map((enrichedInventoryResult) => enrichedInventoryResult._unsafeUnwrap()),
          meta: getPaginationMetadata(count, c.req.valid("query")),
        });
        return c.json(response);
      },
    )
    .post(
      "/",
      describeRoute({
        tags: ["Inventory"],
        responses: {
          ...openApiJsonResponse(200, inventorySchema),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("json", upsertInventoryInput),
      async (c) => {
        const inventoryResult = await c.var.services.inventoryService.createInventory(c.req.valid("json"), c.var.user);

        // TODO handle duplicate inventory
        if (inventoryResult.isErr()) {
          switch (inventoryResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "requiredDataNotFound":
              throw new HTTPException(422);
            default:
              logger.error({ error: inventoryResult.error }, "Unexpected error");
              throw new HTTPException(500);
          }
        }

        const inventory = inventoryResult.value;

        const inventoryEnrichedResult = await enrichedInventory(c.var.services, inventory, c.var.user);

        if (inventoryEnrichedResult.isErr()) {
          switch (inventoryEnrichedResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "extendedDataNotFound":
              return c.notFound();
          }
        }

        const inventoryEnriched = inventoryEnrichedResult.value;

        const response = inventorySchema.parse(inventoryEnriched);
        return c.json(response);
      },
    )
    .put(
      "/:id",
      describeRoute({
        tags: ["Inventory"],
        responses: {
          ...openApiJsonResponse(200, inventorySchema),
          ...openApiJsonResponse(409, z.object({ correspondingInventoryFound: z.string() })),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamSchema),
      zodValidator("json", upsertInventoryInput),
      async (c) => {
        const inventoryResult = await c.var.services.inventoryService.updateInventory(
          c.req.valid("param").id,
          c.req.valid("json"),
          c.var.user,
        );

        if (inventoryResult.isErr()) {
          switch (inventoryResult.error.type) {
            case "notAllowed":
              throw new HTTPException(403);
            case "requiredDataNotFound":
              throw new HTTPException(422);
            case "similarInventoryAlreadyExists": {
              // TODO handle duplicate inventory on caller side
              const response = z
                .object({ correspondingInventoryFound: z.string() })
                .parse({ correspondingInventoryFound: inventoryResult.error.correspondingInventoryFound });
              return c.json(response, 409);
            }
            default:
              logger.error({ error: inventoryResult.error }, "Unexpected error");
              throw new HTTPException(500);
          }
        }

        const inventory = inventoryResult.value;

        const inventoryEnrichedResult = await enrichedInventory(c.var.services, inventory, c.var.user);

        if (inventoryEnrichedResult.isErr()) {
          switch (inventoryEnrichedResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "extendedDataNotFound":
              return c.notFound();
          }
        }

        const inventoryEnriched = inventoryEnrichedResult.value;

        const response = inventorySchema.parse(inventoryEnriched);
        return c.json(response);
      },
    )
    .delete(
      "/:id",
      describeRoute({
        tags: ["Inventory"],
        responses: {
          ...openApiJsonResponse(200, z.object({ id: z.string() })),
          ...openApiDefaultErrorResponses([403, 404, 409, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamSchema),
      async (c) => {
        const deletedInventoryResult = await c.var.services.inventoryService.deleteInventory(
          c.req.valid("param").id,
          c.var.user,
        );

        if (deletedInventoryResult.isErr()) {
          switch (deletedInventoryResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "inventoryStillInUse":
              throw new HTTPException(409);
          }
        }

        const deletedInventory = deletedInventoryResult.value;

        if (!deletedInventory) {
          return c.notFound();
        }

        const response = z.object({ id: z.string() }).parse({ id: deletedInventory.id });
        return c.json(response);
      },
    );
};
