import {
  getInventoriesQueryParamsSchema,
  getInventoriesResponse,
  getInventoryIndexParamsSchema,
  getInventoryIndexResponse,
  getInventoryResponse,
  upsertInventoryInput,
  upsertInventoryResponse,
} from "@ou-ca/common/api/inventory.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import { logger } from "../../../utils/logger.js";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedInventory } from "./inventories-enricher.js";

export const inventoriesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { inventoryService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Inventory"],
        params: idParamSchema,
        response: withAuthenticationErrorResponses({
          200: getInventoryResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const inventoryResult = await inventoryService.findInventory(req.params.id, req.user);

      if (inventoryResult.isErr()) {
        switch (inventoryResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const inventory = inventoryResult.value;

      if (!inventory) {
        return await reply.notFound();
      }

      const inventoryEnrichedResult = await enrichedInventory(services, inventory, req.user);

      if (inventoryEnrichedResult.isErr()) {
        switch (inventoryEnrichedResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "extendedDataNotFound":
            return await reply.notFound();
        }
      }

      return await reply.send(inventoryEnrichedResult.value);
    },
  );

  fastify.get(
    "/:id/index",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Inventory"],
        params: idParamSchema,
        querystring: getInventoryIndexParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getInventoryIndexResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const inventoryIndexResult = await inventoryService.findInventoryIndex(req.params.id, req.query, req.user);

      if (inventoryIndexResult.isErr()) {
        switch (inventoryIndexResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const inventoryIndex = inventoryIndexResult.value;

      if (inventoryIndex == null) {
        return await reply.notFound();
      }
      return await reply.send(inventoryIndex);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Inventory"],
        querystring: getInventoriesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getInventoriesResponse,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await inventoryService.findPaginatedInventories(req.user, req.query),
        await inventoryService.getInventoriesCount(req.user),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [inventoriesData, count] = paginatedResults.value;

      // TODO look to optimize this request
      const enrichedInventoriesResults = await Promise.all(
        inventoriesData.map(async (inventoryData) => {
          return enrichedInventory(services, inventoryData, req.user);
        }),
      );

      return await reply.send({
        data: enrichedInventoriesResults.map((enrichedInventoryResult) => enrichedInventoryResult._unsafeUnwrap()),
        meta: getPaginationMetadata(count, req.query),
      });
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Inventory"],
        body: upsertInventoryInput,
        response: withAuthenticationErrorResponses({
          200: upsertInventoryResponse,
          ...buildFastifyDefaultErrorResponses([403, 404, 422, 500]),
        }),
      },
    },
    async (req, reply) => {
      const inventoryResult = await inventoryService.createInventory(req.body, req.user);

      // TODO handle duplicate inventory
      if (inventoryResult.isErr()) {
        switch (inventoryResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "requiredDataNotFound":
            return await reply.status(422).send();
          default:
            logger.error({ error: inventoryResult.error }, "Unexpected error");
            return await reply.internalServerError();
        }
      }

      const inventory = inventoryResult.value;

      const inventoryEnrichedResult = await enrichedInventory(services, inventory, req.user);

      if (inventoryEnrichedResult.isErr()) {
        switch (inventoryEnrichedResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "extendedDataNotFound":
            return await reply.notFound();
        }
      }

      const inventoryEnriched = inventoryEnrichedResult.value;

      return await reply.send(inventoryEnriched);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Inventory"],
        params: idParamSchema,
        body: upsertInventoryInput,
        response: withAuthenticationErrorResponses({
          200: upsertInventoryResponse,
          409: z.object({ correspondingInventoryFound: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 422, 500]),
        }),
      },
    },
    async (req, reply) => {
      const inventoryResult = await inventoryService.updateInventory(req.params.id, req.body, req.user);

      if (inventoryResult.isErr()) {
        switch (inventoryResult.error.type) {
          case "notAllowed":
            return await reply.forbidden();
          case "requiredDataNotFound":
            return await reply.status(422).send();
          case "similarInventoryAlreadyExists":
            // TODO handle duplicate inventory on caller side
            return await reply
              .status(409)
              .send({ correspondingInventoryFound: inventoryResult.error.correspondingInventoryFound });
          default:
            logger.error({ error: inventoryResult.error }, "Unexpected error");
            return await reply.internalServerError();
        }
      }

      const inventory = inventoryResult.value;

      const inventoryEnrichedResult = await enrichedInventory(services, inventory, req.user);

      if (inventoryEnrichedResult.isErr()) {
        switch (inventoryEnrichedResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "extendedDataNotFound":
            return await reply.notFound();
        }
      }

      const inventoryEnriched = inventoryEnrichedResult.value;

      return await reply.send(inventoryEnriched);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Inventory"],
        params: idParamSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedInventoryResult = await inventoryService.deleteInventory(req.params.id, req.user);

      if (deletedInventoryResult.isErr()) {
        switch (deletedInventoryResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "inventoryStillInUse":
            return await reply.conflict();
        }
      }

      const deletedInventory = deletedInventoryResult.value;

      if (!deletedInventory) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedInventory.id });
    },
  );

  done();
};
