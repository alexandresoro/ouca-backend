import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import type { Logger } from "pino";
import type { Services } from "../../services/services.js";
import { buildApiV1Factory } from "./api-v1-factory.js";
import { buildHonoApiV1 } from "./hono-api-v1.js";

const V1_PREFIX = "/v1";
const OPENAPI_SPEC_PATH = "/openapi";

export const buildHonoApi = (services: Services, logger: Logger) => {
  const apiApp = new Hono();

  // OpenAPI spec for API
  apiApp
    .get(
      OPENAPI_SPEC_PATH,
      openAPISpecs(apiApp, {
        documentation: {
          openapi: "3.1.1",
          info: {
            title: "Ou ca API",
            version: "1.0.0",
            description: "",
          },
          components: {
            securitySchemes: {
              token: {
                type: "http",
                scheme: "bearer",
              },
            },
          },
          security: [
            {
              token: [],
            },
          ],
        },
      }),
    )
    .get(
      "/documentation",
      apiReference({
        spec: {
          url: OPENAPI_SPEC_PATH,
        },
      }),
    );

  const apiV1Factory = buildApiV1Factory(services);
  apiApp.route(V1_PREFIX, buildHonoApiV1(apiV1Factory, services));

  logger.debug("Hono API routes registered");

  return apiApp;
};
