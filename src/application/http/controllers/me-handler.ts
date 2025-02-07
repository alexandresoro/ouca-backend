import type { User } from "@domain/user/user.js";
import { getMeResponse, putMeInput } from "@ou-ca/common/api/me.js";
import { describeRoute } from "hono-openapi";
import type { ApiV1Factory } from "../context.js";
import { openApiDefaultErrorResponses, openApiJsonResponse } from "./hono/openapi-utils.js";
import { zodValidator } from "./hono/zod-validator.js";

export const meHandler = (factory: ApiV1Factory) => {
  return factory
    .createApp()
    .get(
      "/",
      describeRoute({
        tags: ["User"],
        responses: {
          ...openApiJsonResponse(200, getMeResponse),
          ...openApiDefaultErrorResponses([404]),
        },
        validateResponse: true,
      }),
      async (c) => {
        const user = await c.var.services.userService.getUser(c.var.user.id);

        if (!user) {
          c.text("Internal user not found");
          return c.notFound();
        }

        const response = getMeResponse.parse({
          id: c.var.user.id,
          settings: user.settings,
          user: c.var.oidcUser,
          permissions: c.var.user.permissions,
        });

        return c.json(response);
      },
    )
    .put(
      "/",
      describeRoute({
        tags: ["User"],
        responses: {
          ...openApiJsonResponse(200, getMeResponse),
          ...openApiDefaultErrorResponses([404]),
        },
        validateResponse: true,
      }),
      zodValidator("json", putMeInput),
      async (c) => {
        const reshapedInput = {
          defaultObserverId: c.req.valid("json").defaultObserver ?? undefined,
          defaultDepartmentId: c.req.valid("json").defaultDepartment ?? undefined,
          defaultAgeId: c.req.valid("json").defaultAge ?? undefined,
          defaultSexId: c.req.valid("json").defaultSexe ?? undefined,
          defaultNumberEstimateId: c.req.valid("json").defaultEstimationNombre ?? undefined,
          defaultNumber: c.req.valid("json").defaultNombre ?? undefined,
          displayAssociates: c.req.valid("json").areAssociesDisplayed ?? undefined,
          displayWeather: c.req.valid("json").isMeteoDisplayed ?? undefined,
          displayDistance: c.req.valid("json").isDistanceDisplayed ?? undefined,
        } satisfies User["settings"];

        const updatedUser = await c.var.services.userService.updateSettings(c.var.user.id, reshapedInput);

        const response = getMeResponse.parse({
          id: updatedUser.id,
          settings: updatedUser.settings,
          user: c.var.oidcUser,
          permissions: c.var.user.permissions,
        });

        return c.json(response);
      },
    );
};
