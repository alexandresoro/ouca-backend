import { importStatusSchema } from "@ou-ca/common/import/import-status";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Services } from "../../../services/services.js";
import { withAuthenticationErrorResponses } from "../../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses } from "../api-utils.js";

export const importStatusController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  fastify.get(
    "/import-status/:importId",
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
