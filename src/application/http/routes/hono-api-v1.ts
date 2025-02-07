import { Hono } from "hono";
import type { Factory } from "hono/factory";
import type { Services } from "../../services/services.js";
import type { EnvApiV1 } from "../context.js";
import { agesHandler } from "../controllers/ages-handler.js";
import { altitudeHandler } from "../controllers/altitude-handler.js";
import { behaviorsHandler } from "../controllers/behaviors-handler.js";
import { speciesClassesHandler } from "../controllers/classes-handler.js";
import { departmentsHandler } from "../controllers/departments-handler.js";
import { distanceEstimatesHandler } from "../controllers/distance-estimates-handler.js";
import { entriesHandler } from "../controllers/entries-handler.js";
import { environmentsHandler } from "../controllers/environments-handler.js";
import { generateExportHandler } from "../controllers/generate-export-handler.js";
import { geojsonHandler } from "../controllers/geojson-handler.js";
import { importHandler } from "../controllers/import-handler.js";
import { inventoriesHandler } from "../controllers/inventories-handler.js";
import { localitiesHandler } from "../controllers/localities-handler.js";
import { meHandler } from "../controllers/me-handler.js";
import { numberEstimatesHandler } from "../controllers/number-estimates-handler.js";
import { observersHandler } from "../controllers/observers-handler.js";
import { searchHandler } from "../controllers/search-handler.js";
import { sexesHandler } from "../controllers/sexes-handler.js";
import { speciesHandler } from "../controllers/species-handler.js";
import { townsHandler } from "../controllers/towns-handler.js";
import { userHandler } from "../controllers/user-handler.js";
import { weathersHandler } from "../controllers/weathers-handler.js";

export const buildHonoApiV1 = (apiV1Factory: Factory<EnvApiV1>, services: Services) => {
  return (
    new Hono()
      .route("/ages", agesHandler(apiV1Factory))
      .route("/behaviors", behaviorsHandler(apiV1Factory))
      .route("/classes", speciesClassesHandler(apiV1Factory))
      .route("/departments", departmentsHandler(apiV1Factory))
      .route("/distance-estimates", distanceEstimatesHandler(apiV1Factory))
      .route("/entries", entriesHandler(apiV1Factory))
      .route("/environments", environmentsHandler(apiV1Factory))
      .route("/inventories", inventoriesHandler(apiV1Factory))
      .route("/localities", localitiesHandler(apiV1Factory))
      .route("/number-estimates", numberEstimatesHandler(apiV1Factory))
      .route("/observers", observersHandler(apiV1Factory))
      .route("/sexes", sexesHandler(apiV1Factory))
      .route("/species", speciesHandler(apiV1Factory))
      .route("/towns", townsHandler(apiV1Factory))
      .route("/weathers", weathersHandler(apiV1Factory))
      //
      .route("/search", searchHandler(apiV1Factory))
      .route("/altitude", altitudeHandler(apiV1Factory))
      .route("/geojson", geojsonHandler(apiV1Factory))
      .route("/generate-export", generateExportHandler(apiV1Factory))
      .route("/import", importHandler(apiV1Factory))
      .route("/me", meHandler(apiV1Factory))
      // User handler is a bit different as it might be reached without having a proper user account
      .route("/user", userHandler(services))
  );
};
