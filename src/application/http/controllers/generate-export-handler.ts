import { getSearchCriteriaParamsSchema } from "@ou-ca/common/api/common/search-criteria.js";
import type { HonoRequest } from "hono";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { ApiV1Factory } from "../context.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

const getExportUrl = (req: HonoRequest, exportId: string) => {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/download/${exportId}`;
};

export const generateExportHandler = (factory: ApiV1Factory) => {
  return factory
    .createApp()
    .post(
      "/ages",
      describeRoute({
        tags: ["Export", "Age"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateAgesExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/classes",
      describeRoute({
        tags: ["Export", "Species"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateClassesExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/towns",
      describeRoute({
        tags: ["Export", "Location"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateTownsExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/behaviors",
      describeRoute({
        tags: ["Export", "Behavior"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateBehaviorsExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/departments",
      describeRoute({
        tags: ["Export", "Location"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateDepartmentsExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/species",
      describeRoute({
        tags: ["Export", "Species"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateSpeciesExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/distance-estimates",
      describeRoute({
        tags: ["Export", "Distance"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateDistanceEstimatesExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/number-estimates",
      describeRoute({
        tags: ["Export", "Quantity"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateNumberEstimatesExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/localities",
      describeRoute({
        tags: ["Export", "Location"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateLocalitiesExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/weathers",
      describeRoute({
        tags: ["Export", "Weather"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateWeathersExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/environments",
      describeRoute({
        tags: ["Export", "Environment"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateEnvironmentsExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/observers",
      describeRoute({
        tags: ["Export", "Observer"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateObserversExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/sexes",
      describeRoute({
        tags: ["Export", "Sex"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const idResult = await c.var.services.exportService.generateSexesExport(c.var.user);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    )
    .post(
      "/entries",
      describeRoute({
        tags: ["Export", "Entry"],
        responses: {
          ...openApiJsonResponse(201, z.null(), {
            headers: {
              // biome-ignore lint/style/useNamingConvention: <explanation>
              Location: {
                schema: {
                  type: "string",
                  format: "uri",
                },
                description: "The URL to download the export",
              },
            },
          }),
          ...openApiDefaultErrorResponses([403, 422, 500]),
        },
        validateResponse: true,
      }),
      zodValidator("query", getSearchCriteriaParamsSchema),
      async (c) => {
        if (c.req.valid("query").fromAllUsers && !c.var.user.permissions.canViewAllEntries) {
          throw new HTTPException(403);
        }

        // If we don't want to see all users' entries, we need to filter by ownerId
        const reshapedQueryParams = {
          ...c.req.valid("query"),
          ownerId: c.req.valid("query").fromAllUsers ? undefined : c.var.user.id,
        };

        // TODO add search criteria
        const idResult = await c.var.services.exportService.generateEntriesExport(c.var.user, reshapedQueryParams);

        if (idResult.isErr()) {
          switch (idResult.error) {
            case "notAllowed":
              throw new HTTPException(403);
          }
        }

        return c.body(null, 201, {
          // biome-ignore lint/style/useNamingConvention: <explanation>
          Location: getExportUrl(c.req, idResult.value),
        });
      },
    );
};
