import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const altitudeHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(
              200,
              z.object({
                altitude: z.number(),
              }),
            ),
            ...openApiDefaultErrorResponses([404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator(
          "query",
          z.object({
            latitude: z.coerce.number().min(-90).max(90),
            longitude: z.coerce.number().min(-180).max(180),
          }),
        ),
        async (c) => {
          const altitudeResult = await c.var.services.altitudeService.getAltitude(c.req.valid("query"));

          if (altitudeResult.isErr()) {
            switch (altitudeResult.error) {
              case "coordinatesNotSupported":
                return c.notFound();
              case "fetchError":
                throw new HTTPException();
              case "parseError":
                throw new HTTPException();
            }
          }

          const parsedValue = z
            .object({
              altitude: z.number(),
            })
            .parse(altitudeResult.value);
          return c.json(parsedValue);
        },
      )
  );
};
