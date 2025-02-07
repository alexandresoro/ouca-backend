import { entityInfoSchema } from "@ou-ca/common/api/common/entity-info.js";
import { weatherSchema } from "@ou-ca/common/api/entities/weather.js";
import { getWeathersQueryParamsSchema, upsertWeatherInput } from "@ou-ca/common/api/weather.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const weathersHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Weather"],
          responses: {
            ...openApiJsonResponse(200, weatherSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const weatherResult = await c.var.services.weatherService.findWeather(c.req.valid("param").id, c.var.user);

          if (weatherResult.isErr()) {
            switch (weatherResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const weather = weatherResult.value;

          if (!weather) {
            return c.notFound();
          }

          const parsedWeather = weatherSchema.parse(weather);
          return c.json(parsedWeather);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Weather"],
          responses: {
            ...openApiJsonResponse(200, entityInfoSchema),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const weatherInfoResult = Result.combine([
            await c.var.services.weatherService.getEntriesCountByWeather(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.weatherService.isWeatherUsed(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (weatherInfoResult.isErr()) {
            switch (weatherInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isWeatherUsed] = weatherInfoResult.value;

          const response = entityInfoSchema.parse({
            canBeDeleted: !isWeatherUsed,
            ownEntriesCount,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Weather"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(weatherSchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getWeathersQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.weatherService.findPaginatedWeathers(c.var.user, c.req.valid("query")),
            await c.var.services.weatherService.getWeathersCount(c.var.user, c.req.valid("query").q),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(weatherSchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Weather"],
          responses: {
            ...openApiJsonResponse(200, weatherSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertWeatherInput),
        async (c) => {
          const weatherCreateResult = await c.var.services.weatherService.createWeather(
            c.req.valid("json"),
            c.var.user,
          );

          if (weatherCreateResult.isErr()) {
            switch (weatherCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = weatherSchema.parse(weatherCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Weather"],
          responses: {
            ...openApiJsonResponse(200, weatherSchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertWeatherInput),
        async (c) => {
          const weatherUpdateResult = await c.var.services.weatherService.updateWeather(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (weatherUpdateResult.isErr()) {
            switch (weatherUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = weatherSchema.parse(weatherUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Weather"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedWeatherResult = await c.var.services.weatherService.deleteWeather(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedWeatherResult.isErr()) {
            switch (deletedWeatherResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedWeather = deletedWeatherResult.value;

          if (!deletedWeather) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedWeather.id });
          return c.json(response);
        },
      )
  );
};
