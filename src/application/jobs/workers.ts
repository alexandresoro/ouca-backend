import { workerLogger } from "@infrastructure/bullmq/worker.js";
import type { Services } from "../services/services.js";
import { startGeoJSONWorker } from "./geojson/geojson-worker.js";
import { startImportWorker } from "./import/import-worker.js";

export const startWorkers = (services: Services) => {
  const { geojsonService, importService } = services;

  workerLogger.info("Starting workers");

  // GeoJSON worker
  startGeoJSONWorker({ geojsonService });

  // Import worker
  startImportWorker({ importService });

  workerLogger.info("Workers started");
};
