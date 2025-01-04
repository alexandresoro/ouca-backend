import { getSearchCriteriaParamsSchema } from "@ou-ca/common/api/common/search-criteria";
import type { FastifyRequest } from "fastify";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";

const getExportUrl = (req: FastifyRequest, exportId: string) => {
  return `${req.protocol}://${req.hostname}/download/${exportId}`;
};

export const generateExportController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { exportService } = services;

  fastify.post(
    "/ages",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Age"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateAgesExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/classes",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Species"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateClassesExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/towns",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Location"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateTownsExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/behaviors",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Behavior"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateBehaviorsExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/departments",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Location"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateDepartmentsExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/species",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Species"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateSpeciesExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/distance-estimates",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Distance"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateDistanceEstimatesExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/number-estimates",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Quantity"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateNumberEstimatesExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/localities",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Location"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateLocalitiesExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/weathers",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Weather"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateWeathersExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/environments",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Environment"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateEnvironmentsExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/observers",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Observer"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateObserversExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/sexes",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Sex"],
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      const idResult = await exportService.generateSexesExport(req.user);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  fastify.post(
    "/entries",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Export", "Entry"],
        querystring: getSearchCriteriaParamsSchema,
        response: withAuthenticationErrorResponses({}),
      },
    },
    async (req, reply) => {
      if (req.query.fromAllUsers && !req.user?.permissions.canViewAllEntries) {
        return await reply.status(403).send();
      }

      // If we don't want to see all users' entries, we need to filter by ownerId
      const reshapedQueryParams = {
        ...req.query,
        ownerId: req.query.fromAllUsers ? undefined : req.user?.id,
      };

      // TODO add search criteria
      const idResult = await exportService.generateEntriesExport(req.user, reshapedQueryParams);

      if (idResult.isErr()) {
        switch (idResult.error) {
          case "notAllowed":
            return await reply.status(403).send();
        }
      }

      return reply.header("Location", getExportUrl(req, idResult.value)).status(201).send();
    },
  );

  done();
};
