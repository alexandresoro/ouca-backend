import { importStatusSchema } from "@domain/import/import-status.js";
import { IMPORT_TYPE, type ImportType } from "@domain/import/import-type.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

// TODO: TEST THIS

const importEntityHandler = (factory: ApiV1Factory, entity: ImportType) => {
  return factory.createHandlers(
    describeRoute({
      tags: ["Import"],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                },
              },
              required: ["file"],
            },
          },
        },
      },
      responses: {
        ...openApiJsonResponse(
          200,
          z.object({
            uploadId: z.string(),
          }),
        ),
        ...openApiDefaultErrorResponses([400, 403, 500]),
      },
      validateResponse: true,
    }),
    async (c) => {
      if (!c.var.user.permissions.canImport) {
        throw new HTTPException(403);
      }

      // TODO check direct file upload w/o multipart
      const body = await c.req.parseBody();
      const data = body.file;

      if (!(data instanceof File)) {
        throw new HTTPException(400);
      }

      const uploadId = await c.var.services.importService.createImportJob(
        // TODO: CHECK THIS
        Buffer.from(await data.text()),
        entity,
        c.var.user,
      );

      const response = z
        .object({
          uploadId: z.string(),
        })
        .parse({
          uploadId,
        });
      return c.json(response);
    },
  );
};

export const importHandler = (factory: ApiV1Factory) => {
  const app = factory.createApp();

  for (const entity of IMPORT_TYPE) {
    app.post(`/${entity}`, ...importEntityHandler(factory, entity));
  }

  return app.get(
    "/status/:importId",
    describeRoute({
      tags: ["Import"],
      responses: {
        ...openApiJsonResponse(200, importStatusSchema),
        ...openApiDefaultErrorResponses([403, 404, 422, 500]),
      },
      validateResponse: true,
    }),
    zodValidator(
      "param",
      z.object({
        importId: z.string().uuid(),
      }),
    ),
    async (c) => {
      if (!c.var.user.permissions.canImport) {
        throw new HTTPException(403);
      }

      const status = await c.var.services.importService.getImportStatus(c.req.valid("param").importId, c.var.user);

      if (status == null) {
        throw new HTTPException(404);
      }

      const response = importStatusSchema.parse(status);
      return c.json(response);
    },
  );
};
