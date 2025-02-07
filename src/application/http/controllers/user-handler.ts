import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { oidcAuth } from "../middlewares/oidc-auth.js";
import { injectServices } from "../middlewares/services.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";

export const userHandler = (services: Services) => {
  return new Hono()
    .use(
      // Service injection
      injectServices(services),
      // Authentication
      oidcAuth,
    )
    .post(
      "/create",
      describeRoute({
        tags: ["User"],
        responses: {
          ...openApiJsonResponse(
            201,
            z.object({
              id: z.string(),
            }),
          ),
          ...openApiDefaultErrorResponses([403, 500]),
        },
        validateResponse: true,
      }),
      async (c) => {
        // Only user with active roles can create account
        const role = c.var.services.oidcService.getHighestRoleFromLoggedUser(c.var.oidcUser);
        if (!role) {
          throw new HTTPException(403);
        }

        const { id } = await c.var.services.userService.createUser({
          extProvider: c.var.oidcUser.oidcProvider,
          extProviderUserId: c.var.oidcUser.sub,
        });
        return c.json({ id }, 201);
      },
    );
};
