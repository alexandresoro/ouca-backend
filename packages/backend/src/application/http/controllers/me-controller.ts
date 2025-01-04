import type { User } from "@domain/user/user.js";
import { getMeResponse, putMeInput } from "@ou-ca/common/api/me";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { Services } from "../../services/services.js";
import { withAuthenticationErrorResponses } from "../hooks/handle-authorization-hook.js";

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
        response: withAuthenticationErrorResponses({}),
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

      const responseBody = getMeResponse.parse({
        id,
        settings,
        user: req.user.oidcUser,
        permissions: req.user.permissions,
      });

      return await reply.send(responseBody);
    },
  );

  fastify.put(
    "/",
    {
      schema: {
        security: [{ token: [] }],
        tags: ["User"],
        body: putMeInput,
        response: withAuthenticationErrorResponses({}),
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

      const responseBody = getMeResponse.parse({
        id,
        settings,
        user: req.user.oidcUser,
        permissions: req.user.permissions,
      });

      return await reply.send(responseBody);
    },
  );

  done();
};
