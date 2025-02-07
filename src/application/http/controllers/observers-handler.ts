import { observerSchema } from "@ou-ca/common/api/entities/observer.js";
import { getObserversQueryParamsSchema, observerInfoSchema, upsertObserverInput } from "@ou-ca/common/api/observer.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const observersHandler = (factory: ApiV1Factory) => {
  return factory
    .createApp()
    .get(
      "/:id",
      describeRoute({
        tags: ["Observer"],
        responses: {
          ...openApiJsonResponse(200, observerSchema),
          ...openApiDefaultErrorResponses([403, 404, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamAsNumberSchema),
      async (c) => {
        const observerResult = await c.var.services.observerService.findObserver(c.req.valid("param").id, c.var.user);

        if (observerResult.isErr()) {
          switch (observerResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const observer = observerResult.value;

        if (!observer) {
          return c.notFound();
        }

        const parsedObserver = observerSchema.parse(observer);
        return c.json(parsedObserver);
      },
    )
    .get(
      "/:id/info",
      describeRoute({
        tags: ["Observer"],
        responses: {
          ...openApiJsonResponse(200, observerInfoSchema),
          ...openApiDefaultErrorResponses([403, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamAsNumberSchema),
      async (c) => {
        const observerInfoResult = Result.combine([
          await c.var.services.observerService.getEntriesCountByObserver(`${c.req.valid("param").id}`, c.var.user),
          await c.var.services.observerService.isObserverUsed(`${c.req.valid("param").id}`, c.var.user),
        ]);

        if (observerInfoResult.isErr()) {
          switch (observerInfoResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const [ownEntriesCount, isObserverUsed] = observerInfoResult.value;

        const parsedResponse = observerInfoSchema.parse({
          canBeDeleted: !isObserverUsed,
          ownEntriesCount,
        });
        return c.json(parsedResponse);
      },
    )
    .get(
      "/",
      describeRoute({
        tags: ["Observer"],
        responses: {
          ...openApiJsonResponse(200, getPaginatedResponseSchema(observerSchema)),
          ...openApiDefaultErrorResponses([403, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("query", getObserversQueryParamsSchema),
      async (c) => {
        const paginatedResults = Result.combine([
          await c.var.services.observerService.findPaginatedObservers(c.var.user, c.req.valid("query")),
          await c.var.services.observerService.getObserversCount(c.var.user, c.req.valid("query").q),
        ]);

        if (paginatedResults.isErr()) {
          switch (paginatedResults.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        const [data, count] = paginatedResults.value;

        const parsedResponse = getPaginatedResponseSchema(observerSchema).parse({
          data,
          meta: getPaginationMetadata(count, c.req.valid("query")),
        });
        return c.json(parsedResponse);
      },
    )
    .post(
      "/",
      describeRoute({
        tags: ["Observer"],
        responses: {
          ...openApiJsonResponse(200, observerSchema),
          ...openApiDefaultErrorResponses([403, 409, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("json", upsertObserverInput),
      async (c) => {
        const observerCreateResult = await c.var.services.observerService.createObserver(
          c.req.valid("json"),
          c.var.user,
        );

        if (observerCreateResult.isErr()) {
          switch (observerCreateResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "alreadyExists":
              throw new HTTPException(409);
          }
        }

        const parsedObserver = observerSchema.parse(observerCreateResult.value);
        return c.json(parsedObserver);
      },
    )
    .put(
      "/:id",
      describeRoute({
        tags: ["Observer"],
        responses: {
          ...openApiJsonResponse(200, observerSchema),
          ...openApiDefaultErrorResponses([403, 409, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamAsNumberSchema),
      zodValidator("json", upsertObserverInput),
      async (c) => {
        const observerUpdateResult = await c.var.services.observerService.updateObserver(
          c.req.valid("param").id,
          c.req.valid("json"),
          c.var.user,
        );

        if (observerUpdateResult.isErr()) {
          switch (observerUpdateResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "alreadyExists":
              throw new HTTPException(409);
          }
        }

        const parsedObserver = observerSchema.parse(observerUpdateResult.value);
        return c.json(parsedObserver);
      },
    )
    .delete(
      "/:id",
      describeRoute({
        tags: ["Observer"],
        responses: {
          ...openApiJsonResponse(200, z.object({ id: z.string() })),
          ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("param", idParamAsNumberSchema),
      async (c) => {
        const deletedObserverResult = await c.var.services.observerService.deleteObserver(
          c.req.valid("param").id,
          c.var.user,
        );

        if (deletedObserverResult.isErr()) {
          switch (deletedObserverResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
            case "isUsed":
              throw new HTTPException(409);
          }
        }

        const deletedObserver = deletedObserverResult.value;

        if (!deletedObserver) {
          return c.notFound();
        }

        const parsedDeletedObserver = z.object({ id: z.string() }).parse(deletedObserver);
        return c.json(parsedDeletedObserver);
      },
    );
};
