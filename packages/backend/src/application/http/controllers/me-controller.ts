import type { User } from "@domain/user/user.js";
import { getMeResponse, putMeInput } from "@ou-ca/common/api/me";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";
import { buildFastifyDefaultErrorResponses } from "./api-utils.js";

export const meController: FastifyPluginCallbackZod<{
  services: Services;
}> = (fastify, { services }, done) => {
  const { oidcService, userService } = services;

  fastify.get(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["User"],
        response: withAuthenticationErrorResponses({
          200: getMeResponse,
          404: z.string(),
          ...buildFastifyDefaultErrorResponses([401]),
        }),
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return await reply.status(401).send();
      }

      const userResult = await oidcService.findLoggedUserFromProvider(
        req.user.oidcUser.oidcProvider,
        req.user.oidcUser.sub,
      );

      if (userResult.isErr()) {
        return await reply.status(404).send("Internal user not found");
      }

      const { id, settings } = userResult.value;

      return await reply.send({
        id,
        settings,
        user: req.user.oidcUser,
        permissions: req.user.permissions,
      });
    },
  );

  fastify.put(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["User"],
        body: putMeInput,
        response: withAuthenticationErrorResponses({
          200: getMeResponse,
          ...buildFastifyDefaultErrorResponses([401]),
        }),
      },
    },
    async (req, reply) => {
      if (!req.user) {
        return await reply.status(401).send();
      }

      const reshapedInput = {
        defaultObserverId: req.body.defaultObserver ?? undefined,
        defaultDepartmentId: req.body.defaultDepartment ?? undefined,
        defaultAgeId: req.body.defaultAge ?? undefined,
        defaultSexId: req.body.defaultSexe ?? undefined,
        defaultNumberEstimateId: req.body.defaultEstimationNombre ?? undefined,
        defaultNumber: req.body.defaultNombre ?? undefined,
        displayAssociates: req.body.areAssociesDisplayed ?? undefined,
        displayWeather: req.body.isMeteoDisplayed ?? undefined,
        displayDistance: req.body.isDistanceDisplayed ?? undefined,
      } satisfies User["settings"];

      const updatedUser = await userService.updateSettings(req.user.id, reshapedInput);

      const { id, settings } = updatedUser;

      return await reply.send({
        id,
        settings,
        user: req.user.oidcUser,
        permissions: req.user.permissions,
      });
    },
  );

  done();
};
