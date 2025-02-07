import contentDisposition from "content-disposition";
import { Hono } from "hono";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { zodValidator } from "./hono/zod-validator.js";

export const downloadHandler = (services: Services) => {
  return (
    new Hono()
      //
      .get(
        "/:id",
        zodValidator("param", z.object({ id: z.string() })),
        zodValidator("query", z.object({ filename: z.string().optional() })),
        async (c) => {
          const downloadFromCacheBuffer = await services.exportService.getExport(`${c.req.valid("param").id}`);
          if (downloadFromCacheBuffer != null) {
            c.header("content-disposition", contentDisposition(c.req.valid("query").filename));
            return c.body(downloadFromCacheBuffer);
          }

          return c.notFound();
        },
      )
  );
};
