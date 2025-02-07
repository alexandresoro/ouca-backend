import { localitySchema } from "@ou-ca/common/api/entities/locality.js";
import { localityInfoSchema } from "@ou-ca/common/api/locality.js";
import { getLocalitiesQueryParamsSchema, upsertLocalityInput } from "@ou-ca/common/api/locality.js";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { Result } from "neverthrow";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { idParamAsNumberSchema } from "./api-utils.js";
import { getPaginatedResponseSchema, getPaginationMetadata } from "./common/pagination.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const localitiesHandler = (factory: ApiV1Factory) => {
  return (
    factory
      //
      .createApp()
      .get(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, localitySchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const localityResult = await c.var.services.localityService.findLocality(c.req.valid("param").id, c.var.user);

          if (localityResult.isErr()) {
            switch (localityResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const locality = localityResult.value;

          if (!locality) {
            return c.notFound();
          }

          const parsedLocality = localitySchema.parse(locality);
          return c.json(parsedLocality);
        },
      )
      .get(
        "/:id/info",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, localityInfoSchema),
            ...openApiDefaultErrorResponses([403, 404, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const localityInfoResult = Result.combine([
            await c.var.services.localityService.getEntriesCountByLocality(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.localityService.isLocalityUsed(`${c.req.valid("param").id}`, c.var.user),
            await c.var.services.townService.findTownOfLocalityId(`${c.req.valid("param").id}`, c.var.user),
          ]);

          if (localityInfoResult.isErr()) {
            switch (localityInfoResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [ownEntriesCount, isLocalityUsed, town] = localityInfoResult.value;

          if (!town) {
            return c.notFound();
          }

          const departmentResult = await c.var.services.departmentService.findDepartmentOfTownId(town.id, c.var.user);

          if (departmentResult.isErr()) {
            switch (departmentResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          if (!departmentResult.value) {
            return c.notFound();
          }

          const response = localityInfoSchema.parse({
            canBeDeleted: !isLocalityUsed,
            ownEntriesCount,
            townCode: town.code,
            townName: town.nom,
            departmentCode: departmentResult.value.code,
          });
          return c.json(response);
        },
      )
      .get(
        "/",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, getPaginatedResponseSchema(localitySchema)),
            ...openApiDefaultErrorResponses([403, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("query", getLocalitiesQueryParamsSchema),
        async (c) => {
          const paginatedResults = Result.combine([
            await c.var.services.localityService.findPaginatedLocalities(c.var.user, c.req.valid("query")),
            await c.var.services.localityService.getLocalitiesCount(c.var.user, c.req.valid("query")),
          ]);

          if (paginatedResults.isErr()) {
            switch (paginatedResults.error) {
              case "notAllowed":
                throw new HTTPException(403);
            }
          }

          const [data, count] = paginatedResults.value;

          const response = getPaginatedResponseSchema(localitySchema).parse({
            data,
            meta: getPaginationMetadata(count, c.req.valid("query")),
          });
          return c.json(response);
        },
      )
      .post(
        "/",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, localitySchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("json", upsertLocalityInput),
        async (c) => {
          const localityCreateResult = await c.var.services.localityService.createLocality(
            c.req.valid("json"),
            c.var.user,
          );

          if (localityCreateResult.isErr()) {
            switch (localityCreateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = localitySchema.parse(localityCreateResult.value);
          return c.json(response);
        },
      )
      .put(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, localitySchema),
            ...openApiDefaultErrorResponses([403, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        zodValidator("json", upsertLocalityInput),
        async (c) => {
          const localityUpdateResult = await c.var.services.localityService.updateLocality(
            c.req.valid("param").id,
            c.req.valid("json"),
            c.var.user,
          );

          if (localityUpdateResult.isErr()) {
            switch (localityUpdateResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "alreadyExists":
                throw new HTTPException(409);
            }
          }

          const response = localitySchema.parse(localityUpdateResult.value);
          return c.json(response);
        },
      )
      .delete(
        "/:id",
        describeRoute({
          tags: ["Location"],
          responses: {
            ...openApiJsonResponse(200, z.object({ id: z.string() })),
            ...openApiDefaultErrorResponses([403, 404, 409, 422, 500]),
          },
          validateResponse: true,
        }),
        zodValidator("param", idParamAsNumberSchema),
        async (c) => {
          const deletedLocalityResult = await c.var.services.localityService.deleteLocality(
            c.req.valid("param").id,
            c.var.user,
          );

          if (deletedLocalityResult.isErr()) {
            switch (deletedLocalityResult.error) {
              case "notAllowed":
                throw new HTTPException(403);
              case "isUsed":
                throw new HTTPException(409);
            }
          }

          const deletedLocality = deletedLocalityResult.value;

          if (!deletedLocality) {
            return c.notFound();
          }

          const response = z.object({ id: z.string() }).parse({ id: deletedLocality.id });
          return c.json(response);
        },
      )
  );
};
