import type { FastifyPluginAsync } from "fastify";
import type { Services } from "../../services/services.js";
import { agesController } from "../controllers/ages-controller.js";
import { altitudeController } from "../controllers/altitude-controller.js";
import { behaviorsController } from "../controllers/behaviors-controller.js";
import { classesController } from "../controllers/classes-controller.js";
import { departmentsController } from "../controllers/departments-controller.js";
import { distanceEstimatesController } from "../controllers/distance-estimates-controller.js";
import { entriesController } from "../controllers/entries-controller.js";
import { environmentsController } from "../controllers/environments-controller.js";
import { generateExportController } from "../controllers/generate-export-controllers.js";
import { geojsonController } from "../controllers/geojson-controller.js";
import { importController } from "../controllers/import-controller.js";
import { inventoriesController } from "../controllers/inventories-controller.js";
import { localitiesController } from "../controllers/localities-controller.js";
import { meController } from "../controllers/me-controller.js";
import { numberEstimatesController } from "../controllers/number-estimates-controller.js";
import { observersController } from "../controllers/observers-controller.js";
import { searchController } from "../controllers/search-controller.js";
import { sexesController } from "../controllers/sexes-controller.js";
import { speciesController } from "../controllers/species-controller.js";
import { townsController } from "../controllers/towns-controller.js";
import { weathersController } from "../controllers/weathers-controller.js";
import { handleAuthorizationHook } from "../hooks/handle-authorization-hook.js";

export const apiV1Routes: FastifyPluginAsync<{ services: Services }> = async (fastify, { services }) => {
  // API needs authentication/authorization
  fastify.decorateRequest("user", null);
  fastify.addHook("onRequest", async (request, reply) => {
    await handleAuthorizationHook(request, reply, services);
  });

  await fastify.register(agesController, { services, prefix: "/ages" });
  await fastify.register(behaviorsController, { services, prefix: "/behaviors" });
  await fastify.register(classesController, { services, prefix: "/classes" });
  await fastify.register(departmentsController, { services, prefix: "/departments" });
  await fastify.register(distanceEstimatesController, { services, prefix: "/distance-estimates" });
  await fastify.register(entriesController, { services, prefix: "/entries" });
  await fastify.register(environmentsController, { services, prefix: "/environments" });
  await fastify.register(inventoriesController, { services, prefix: "/inventories" });
  await fastify.register(localitiesController, { services, prefix: "/localities" });
  await fastify.register(numberEstimatesController, { services, prefix: "/number-estimates" });
  await fastify.register(observersController, { services, prefix: "/observers" });
  await fastify.register(sexesController, { services, prefix: "/sexes" });
  await fastify.register(speciesController, { services, prefix: "/species" });
  await fastify.register(townsController, { services, prefix: "/towns" });
  await fastify.register(weathersController, { services, prefix: "/weathers" });

  await fastify.register(searchController, { services, prefix: "/search" });

  await fastify.register(generateExportController, { services, prefix: "/generate-export" });

  await fastify.register(geojsonController, { services, prefix: "/geojson" });

  await fastify.register(altitudeController, { services, prefix: "/altitude" });

  await fastify.register(importController, { services, prefix: "/import" });

  await fastify.register(meController, { services, prefix: "/me" });
};
