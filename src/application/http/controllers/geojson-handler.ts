import { describeRoute } from "hono-openapi";
import { etag } from "hono/etag";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";

export const geojsonHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .use(etag())
      .get(
        "/localities",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, z.unknown()),
            ...openApiDefaultErrorResponses([403, 500]),
          },
        }),
        async (c) => {
          const geoJsonLocalitiesResult = await c.var.services.geojsonService.getLocalities(c.var.user);

          if (geoJsonLocalitiesResult.isErr()) {
            switch (geoJsonLocalitiesResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          return c.body(geoJsonLocalitiesResult.value, 200, {
            "Cache-Control": "private, max-age=300",
            "Content-Type": "application/json; charset=utf-8",
          });
        },
      )
  );
};
