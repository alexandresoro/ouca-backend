import contentDisposition from "content-disposition";
import type { FastifyPluginCallback } from "fastify";
import type { Services } from "../../services/services.js";

export const downloadController: FastifyPluginCallback<{
  services: Services;
}> = (fastify, { services }, done) => {
  fastify.get<{
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Params: { id: string };
    // biome-ignore lint/style/useNamingConvention: <explanation>
    Querystring: { filename?: string };
  }>("/:id", async (req, reply) => {
    const downloadFromCacheBuffer = await services.exportService.getExport(`${req.params.id}`);
    if (downloadFromCacheBuffer != null) {
      return reply.header("content-disposition", contentDisposition(req.query.filename)).send(downloadFromCacheBuffer);
    }

    return reply.notFound();
  });

  done();
};
