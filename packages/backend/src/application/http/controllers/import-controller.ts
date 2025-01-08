import { importStatusSchema } from "@domain/import/import-status.js";
import { IMPORT_TYPE, type ImportType } from "@ou-ca/common/import/import-types";
import type { FastifyInstance } from "fastify";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses } from "./api-utils.js";

const importEntityController = (fastify: FastifyInstance, services: Services, entity: ImportType) => {
  const { importService } = services;

  return fastify.post(
    `/${entity}`,
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Import"],
        response: withAuthenticationErrorResponses({
          200: z.object({
            uploadId: z.string(),
          }),
          ...buildFastifyDefaultErrorResponses([400, 401, 403]),
        }),
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return reply.unauthorized();
      }

      if (!req.user.permissions.canImport) {
        return reply.forbidden();
      }

      const data = await req.file();
      if (!data) {
        return reply.badRequest();
      }

      const uploadId = await importService.createImportJob(await data.toBuffer(), entity, req.user);

      await reply.send({
        uploadId,
      });
    },
  );
};

export const importController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  for (const entity of IMPORT_TYPE) {
    importEntityController(fastify, services, entity);
  }

  fastify.get(
    "/status/:importId",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Import"],
        params: z.object({
          importId: z.string().uuid(),
        }),
        response: withAuthenticationErrorResponses({
          200: importStatusSchema,
          ...buildFastifyDefaultErrorResponses([401, 403, 404]),
        }),
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return reply.unauthorized();
      }

      if (!req.user.permissions.canImport) {
        return reply.forbidden();
      }

      const status = await services.importService.getImportStatus(req.params.importId, req.user);

      if (status == null) {
        return reply.notFound();
      }

      return reply.send(status);
    },
  );

  done();
};
