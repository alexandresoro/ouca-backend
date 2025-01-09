import {
  getEntriesQueryParamsSchema,
  getEntriesResponse,
  getEntryResponse,
  upsertEntryInput,
  upsertEntryResponse,
} from "@ou-ca/common/api/entry.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./controller-utils.js";
import { enrichedEntry } from "./entries-enricher.js";

export const entriesController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { entryService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
        params: idParamSchema,
        response: withAuthenticationErrorResponses({
          200: getEntryResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const entryResult = await entryService.findEntry(req.params.id, req.user);

      if (entryResult.isErr()) {
        switch (entryResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const entry = entryResult.value;

      if (!entry) {
        return await reply.notFound();
      }

      const entryEnrichedResult = await enrichedEntry(services, entry, req.user);

      if (entryEnrichedResult.isErr()) {
        switch (entryEnrichedResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "extendedDataNotFound":
            return await reply.notFound();
        }
      }

      return await reply.send(entryEnrichedResult.value);
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
        querystring: getEntriesQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getEntriesResponse,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      if (req.query.fromAllUsers && !req.user?.permissions.canViewAllEntries) {
        return await reply.forbidden();
      }

      const paginatedResults = Result.combine([
        await entryService.findPaginatedEntries(req.user, req.query),
        await entryService.getEntriesCount(req.user, req.query),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [entriesData, count] = paginatedResults.value;

      // TODO look to optimize this request
      const enrichedEntriesResults = await Promise.all(
        entriesData.map(async (entryData) => {
          return enrichedEntry(services, entryData, req.user);
        }),
      );

      const enrichedEntries = enrichedEntriesResults.map((enrichedEntryResult) => enrichedEntryResult._unsafeUnwrap());

      return await reply.send({
        data: enrichedEntries,
        meta: getPaginationMetadata(count, req.query),
      });
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
        body: upsertEntryInput,
        response: withAuthenticationErrorResponses({
          200: upsertEntryResponse,
          409: z.object({ correspondingEntryFound: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const entryResult = await entryService.createEntry(req.body, req.user);

      if (entryResult.isErr()) {
        switch (entryResult.error.type) {
          case "notAllowed":
            return await reply.forbidden();
          case "similarEntryAlreadyExists":
            return await reply.status(409).send({
              correspondingEntryFound: entryResult.error.correspondingEntryFound,
            });
        }
      }

      const entry = entryResult.value;

      const entryEnrichedResult = await enrichedEntry(services, entry, req.user);

      if (entryEnrichedResult.isErr()) {
        switch (entryEnrichedResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "extendedDataNotFound":
            return await reply.notFound();
        }
      }

      const entryEnriched = entryEnrichedResult.value;

      return await reply.send(entryEnriched);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
        params: idParamSchema,
        body: upsertEntryInput,
        response: withAuthenticationErrorResponses({
          200: upsertEntryResponse,
          409: z.object({ correspondingEntryFound: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const entryResult = await entryService.updateEntry(req.params.id, req.body, req.user);

      if (entryResult.isErr()) {
        switch (entryResult.error.type) {
          case "notAllowed":
            return await reply.forbidden();
          case "similarEntryAlreadyExists":
            return await reply.status(409).send({
              correspondingEntryFound: entryResult.error.correspondingEntryFound,
            });
        }
      }

      const entry = entryResult.value;

      const entryEnrichedResult = await enrichedEntry(services, entry, req.user);

      if (entryEnrichedResult.isErr()) {
        switch (entryEnrichedResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "extendedDataNotFound":
            return await reply.notFound();
        }
      }

      const entryEnriched = entryEnrichedResult.value;

      return await reply.send(entryEnriched);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Entry"],
        params: idParamSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const deletedEntryResult = await entryService.deleteEntry(req.params.id, req.user);

      if (deletedEntryResult.isErr()) {
        switch (deletedEntryResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const deletedEntry = deletedEntryResult.value;

      if (!deletedEntry) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedEntry.id });
    },
  );

  done();
};
