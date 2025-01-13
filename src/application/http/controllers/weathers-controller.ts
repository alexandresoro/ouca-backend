import {
  getWeatherResponse,
  getWeathersQueryParamsSchema,
  getWeathersResponse,
  upsertWeatherInput,
  upsertWeatherResponse,
  weatherInfoSchema,
} from "@ou-ca/common/api/weather.js";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { Result } from "neverthrow";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses, idParamAsNumberSchema } from "./api-utils.js";
import { getPaginationMetadata } from "./common/pagination.js";

export const weathersController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { weatherService } = services;

  fastify.get(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Weather"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: getWeatherResponse,
          ...buildFastifyDefaultErrorResponses([403, 404]),
        }),
      },
    },
    async (req, reply) => {
      const weatherResult = await weatherService.findWeather(req.params.id, req.user);

      if (weatherResult.isErr()) {
        switch (weatherResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const weather = weatherResult.value;

      if (!weather) {
        return await reply.notFound();
      }

      return await reply.send(weather);
    },
  );

  fastify.get(
    "/:id/info",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Weather"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: weatherInfoSchema,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const weatherInfoResult = Result.combine([
        await weatherService.getEntriesCountByWeather(`${req.params.id}`, req.user),
        await weatherService.isWeatherUsed(`${req.params.id}`, req.user),
      ]);

      if (weatherInfoResult.isErr()) {
        switch (weatherInfoResult.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [ownEntriesCount, isWeatherUsed] = weatherInfoResult.value;

      return await reply.send({
        canBeDeleted: !isWeatherUsed,
        ownEntriesCount,
      });
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Weather"],
        querystring: getWeathersQueryParamsSchema,
        response: withAuthenticationErrorResponses({
          200: getWeathersResponse,
          ...buildFastifyDefaultErrorResponses([403]),
        }),
      },
    },
    async (req, reply) => {
      const paginatedResults = Result.combine([
        await weatherService.findPaginatedWeathers(req.user, req.query),
        await weatherService.getWeathersCount(req.user, req.query.q),
      ]);

      if (paginatedResults.isErr()) {
        switch (paginatedResults.error) {
          case "notAllowed":
            return await reply.forbidden();
        }
      }

      const [data, count] = paginatedResults.value;

      return await reply.send({
        data,
        meta: getPaginationMetadata(count, req.query),
      });
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Weather"],
        body: upsertWeatherInput,
        response: withAuthenticationErrorResponses({
          200: upsertWeatherResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const weatherResult = await weatherService.createWeather(req.body, req.user);

      if (weatherResult.isErr()) {
        switch (weatherResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(weatherResult.value);
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Weather"],
        params: idParamAsNumberSchema,
        body: upsertWeatherInput,
        response: withAuthenticationErrorResponses({
          200: upsertWeatherResponse,
          ...buildFastifyDefaultErrorResponses([403, 409]),
        }),
      },
    },
    async (req, reply) => {
      const weatherResult = await weatherService.updateWeather(req.params.id, req.body, req.user);

      if (weatherResult.isErr()) {
        switch (weatherResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "alreadyExists":
            return await reply.conflict();
        }
      }

      return await reply.send(weatherResult.value);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["Weather"],
        params: idParamAsNumberSchema,
        response: withAuthenticationErrorResponses({
          200: z.object({ id: z.string() }),
          ...buildFastifyDefaultErrorResponses([403, 404, 409]),
        }),
      },
    },
    async (req, reply) => {
      const deletedWeatherResult = await weatherService.deleteWeather(req.params.id, req.user);

      if (deletedWeatherResult.isErr()) {
        switch (deletedWeatherResult.error) {
          case "notAllowed":
            return await reply.forbidden();
          case "isUsed":
            return await reply.conflict();
        }
      }

      const deletedWeather = deletedWeatherResult.value;

      if (!deletedWeather) {
        return await reply.notFound();
      }

      return await reply.send({ id: deletedWeather.id });
    },
  );

  done();
};
